import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  setHours,
  isBefore,
  isAfter,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import File from '../models/File';

class OrderForDeliverymanController {
  async index(req, res) {
    const schema = Yup.object().shape({
      end: Yup.bool(),
    });

    // verificando se os dados de entrada estão de acordo com o solicitado no schema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    const deliveryman = await Deliveryman.findByPk(req.deliverymanId);
    const { id } = deliveryman;

    // verificando se o e-mail não foi encontrado
    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman dow not found!' });
    }

    // trazendo encomendas já entregues pelo entregador
    if (req.body.end === true) {
      const ordersEnd = await Order.findAll({
        where: {
          deliveryman_id: id,
          end_date: {
            [Op.not]: null,
          },
        },
      });
      return res.json(ordersEnd);
    }

    // trazendo retorno de todas as encomendas que estão pendentes
    const orders = await Order.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
    });
    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date(),
      signature_id: Yup.number().positive().integer(),
      start_date: Yup.date(),
    });

    // verificando se os dados de entrada estão de acordo com o solicitado no schema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    // dados da encomenda
    const order = await Order.findByPk(req.params.id);

    // dados do entregador
    const deliveryman = await Deliveryman.findByPk(req.deliverymanId);

    // checando se o deliveryman é o entregador da encomenda que vai ser alterada
    if (order.deliveryman_id !== deliveryman.id) {
      return res
        .status(401)
        .json({ error: 'This order cannot change for this deliveryman.' });
    }

    // checando se a data de retirada do produto está sendo passada
    if (req.body.start_date) {
      // se a encomenda já tiver sido retirada, ela não pode receber um novo start_date
      if (order.start_date !== null) {
        return res.status(401).json({ error: 'Order already with drawn!' });
      }

      const { start_date } = req.body;
      const hourStart = parseISO(start_date); // passando a hora para o padrão JS e arredondando a mesma
      const hourBusinessOpen = setHours(startOfDay(hourStart), 8);
      const hourBusinessClosed = setHours(startOfDay(hourStart), 18);

      // verificando se o horário da retirada já passou
      if (isBefore(hourStart, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted!' });
      }

      // verificando se o entregador está retirando a encomenda no horário comercial
      if (
        isBefore(hourStart, hourBusinessOpen) ||
        isAfter(hourStart, hourBusinessClosed)
      ) {
        return res.status(401).json({
          error: 'The pick-up time for orders must be between 8 am and 6 pm',
        });
      }

      const numberOfStarts = await Order.findAll({
        where: {
          deliveryman_id: deliveryman.id,
          start_date: {
            [Op.between]: [startOfDay(hourStart), endOfDay(hourStart)],
          },
        },
      });

      // verificando se o entregador já retirou cinco encomendas no dia
      if (Object.keys(numberOfStarts).length >= 5) {
        return res
          .status(401)
          .json({ error: 'You can only catch 5 orders for day.' });
      }
    }

    // verificando se o end_start está sendo passado com horário retrógrado
    if (req.body.end_date) {
      const { end_date } = req.body;
      const hourEnd = parseISO(end_date); // passando a hora para o padrão JS e arredondando a mesma

      // se a encomenda ainda não foi retirada, não pode ser entregue
      if (!order.start_date) {
        return res
          .status(401)
          .json({ error: 'The order needs to be withdrawn!' });
      }

      // se a encomenda já tiver sido entregue, ela não pode receber um novo end_date
      if (order.end_date !== null) {
        return res.status(401).json({ error: 'Order has already been made!' });
      }

      // verificando se o horário cadastrado de entrega(end_date) não é inferior ao horário de retirada(start_date)
      if (isBefore(hourEnd, order.start_date)) {
        return res
          .status(401)
          .json({ error: 'Delivery date less than pickup date!' });
      }

      // verificando se o horário cadastrado não é anterior ao horário atual
      if (isBefore(hourEnd, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted!' });
      }
    }

    if (req.body.signature_id) {
      // se a foto da assinatura passada não estiver no banco de dados
      const signature = await File.findByPk(req.body.signature_id);
      if (!signature) {
        return res.status(401).json({ error: 'Signature does not exists!' });
      }
    }
    const { id, product, recipient_id, deliveryman_id } = await order.update(
      req.body
    );

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }
}
export default new OrderForDeliverymanController();
