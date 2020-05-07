import * as Yup from 'yup';
import { parseISO, isBefore, startOfDay, setHours, isAfter } from 'date-fns';
// import pt from 'date-fns/locale/pt';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import User from '../models/User';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: { user_id: req.userId },
      order: ['createdAt'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'created_at',
        'updated_at',
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().integer().positive().required(),
      deliveryman_id: Yup.number().integer().positive().required(),
    });

    // verificando se os dados de entrada estão de acordo com o solicitado no schema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    // pegando o usuário que está logado no sistema
    const user = await User.findByPk(req.userId);
    const user_id = user.id;

    // checando se o destinatário está cadastrado no bd
    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return res.status(401).json({ error: 'Recipient do not registered.' });
    }

    // checando se o entregador está cadastrado no bd
    const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);
    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman do not registered.' });
    }

    const { id, product, recipient_id, deliveryman_id } = req.body;
    await Order.create({
      id,
      product,
      recipient_id,
      deliveryman_id,
      user_id,
    });

    // enviando email ao entregador assim que uma encomenda é criada
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova entrega disponível!',
      text: `Nova entrega já disponível para você! Produto: ${product}. Nome do cliente: ${recipient.name}. Endereço: ${recipient.city}/${recipient.state}. CEP: ${recipient.zip_code}. Para mais informações, acesse o sistema.`,
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
      user_id,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number().integer().positive(),
      deliveryman_id: Yup.number().integer().positive(),
      signature_id: Yup.number().integer().positive(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    // verificando se os dados de entrada estão de acordo com o solicitado no schema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    const order = await Order.findByPk(req.params.id);

    // checando se o usuário logado é dono da encomenda que vai ser alterada
    if (order.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'This user cannot change this order.' });
    }

    // checando se o destinatário está cadastrado no bd
    if (req.body.recipient_id && req.body.recipient_id !== order.recipient_id) {
      const recipient = await Recipient.findByPk(req.body.recipient_id);
      if (!recipient) {
        return res.status(401).json({ error: 'Recipient do not registered.' });
      }
    }

    // checando se o entregador está cadastrado no bd
    if (
      req.body.deliveryman_id &&
      req.body.deliveryman_id !== order.deliveryman_id
    ) {
      const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);
      if (!deliveryman) {
        return res
          .status(401)
          .json({ error: 'Deliveryman do not registered.' });
      }
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

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    // checando se a encomenda que está tentando ser deletada existe
    if (!order) {
      return res.status(401).json({ error: 'Order does not exists.' });
    }

    // checando se o usuário logado é dono da encomenda que vai ser alterada
    if (order.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'This user cannot change this order.' });
    }

    // checando se a entrega já foi feita, então ela não pode ser deletada do sistema
    if (order.end_date) {
      return res.status(401).json({
        error: 'This order has already been delivered and cannot be deleted!',
      });
    }

    const deliveryman = await Deliveryman.findByPk(order.deliveryman_id);
    const recipient = await Recipient.findByPk(order.recipient_id);

    // enviando email ao entregador assim que uma encomenda é deletada
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Entrega ${order.id} cancelada!`,
      text: `Entrega cancelada! :( Produto: ${order.product}. Nome do cliente: ${recipient.name}. Endereço: ${recipient.city}/${recipient.state}. CEP: ${recipient.zip_code}. Para mais informações, acesse o sistema.`,
    });

    await order.destroy();

    return res.json('Order deleted.');
  }
}

export default new OrderController();
