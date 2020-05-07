import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import User from '../models/User';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    // verificando se o usuário que está tentando criar um entregador é de fato um admin
    const checkIsAProvider = await User.findByPk(req.userId);
    if (!checkIsAProvider) {
      return res.status(401).json({ error: 'User is not a admin!' });
    }

    // pegando a page que vai vir por query params
    const { page = 1 } = req.query;
    // procurando os registros doe entregadores
    const deliverymans = await Deliveryman.findAll({
      order: ['name'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json(deliverymans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
    });

    // verificando se os dados estão entrando corretamente
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    // verificando se o usuário que está tentando criar um entregador é de fato um admin
    const checkIsAProvider = await User.findByPk(req.userId);
    if (!checkIsAProvider) {
      return res.status(401).json({ error: 'User is not a admin!' });
    }

    const { email } = req.body;

    // checagem se usuário já está cadastrado no sistema
    const checkEmail = await Deliveryman.findOne({
      where: { email },
    });
    if (checkEmail) {
      return res.status(401).json({ error: 'User already exists!' });
    }

    const { id, name } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email('Enter a valid email!'),
      avatar_id: Yup.number(),
    });

    // checagem de entrada de dados
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation Fails!' });
    }

    // verificando se o usuário que está tentando alterar um entregador é de fato um admin
    const checkIsAProvider = await User.findByPk(req.userId);
    if (!checkIsAProvider) {
      return res.status(401).json({ error: 'User is not a admin!' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    // checagem de e-mail
    if (req.body.email) {
      const { email } = req.body;

      // checando se o usuário está tentando alterar o e-mail para o mesmo já cadastrado
      if (deliveryman.email === email) {
        return res.status(401).json({ error: 'Enter a different email!' });
      }

      // checagem se email já está cadastrado no sistema
      const checkEmail = await Deliveryman.findOne({
        where: { email },
      });
      if (checkEmail) {
        return res.status(401).json({ error: 'Email already registered!' });
      }
    }

    // checando se o avatar_id que está tentando ser passado existe de fato
    if (req.body.avatar_id) {
      const { avatar_id } = req.body;

      const imageOk = await File.findByPk(avatar_id);
      if (!imageOk) {
        return res.status(401).json({ error: 'Avatar is not exists!' });
      }
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    // verificando se usuário passado por parâmetro existe ou não
    if (!deliveryman) {
      return res.status(401).json({ error: 'User is not found!' });
    }

    await deliveryman.destroy();

    return res.json({ message: 'The user has been successfully delete!' });
  }
}

export default new DeliverymanController();
