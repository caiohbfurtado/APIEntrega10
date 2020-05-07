import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import DeliveryProblem from '../models/DeliveryProblem';
import Recipient from '../models/Recipient';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.deliverymanId);
    const order = await Order.findByPk(req.params.id);

    // verificando se o entregador pode pedir a listagem de notificações dessa encomenda
    if (deliveryman.id !== order.deliveryman_id) {
      return res.status(401).json({
        error: 'This delivery person is not allowed to pick up this delivery',
      });
    }

    const orderProblems = await DeliveryProblem.findAll({
      where: { delivery_id: req.params.id },
      order: ['created_at'],
      include: [
        {
          model: Order,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'name', 'city', 'state', 'zip_code'],
            },
          ],
        },
      ],
      attributes: ['id', 'description', 'createdAt'],
    });

    if (!orderProblems[0]) {
      return res.json({ message: 'This delivery has no notifications' });
    }
    return res.json(orderProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    // verificando se os dados estão sendo enviados
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    // trazendo os dados da entrega
    const order = await Order.findByPk(req.params.id);
    const { deliveryman_id } = order;

    // verificando se quem está querendo criar o problema na entrega é o entregador responsável
    const deliveryman = await Deliveryman.findByPk(req.deliverymanId);

    if (deliveryman_id !== deliveryman.id) {
      return res
        .status(401)
        .json({ error: `Delivery person is not allowed to do this.` });
    }

    // vendo se a entrega já foi retirada e ainda não foi entregue
    if (order.start_date === null || order.end_date !== null) {
      return res
        .status(401)
        .json({ error: 'Delivery problem cannot be registered in the system' });
    }

    const { delivery_id, description } = await DeliveryProblem.create({
      delivery_id: req.params.id,
      description: req.body.description,
    });

    return res.json({ delivery_id, description });
  }
}

export default new DeliveryProblemController();
