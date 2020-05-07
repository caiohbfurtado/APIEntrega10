import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import authConfig from '../../config/authDeliveryman';

class SessionDeliverymanController {
  async store(req, res) {
    // configurando o tipo de dado que vai chegar pelo req.body
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
    });

    // verificando se os dados passados no req.body estão de fato de acordo com as configuraçõs acima
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { email } = req.body;

    const deliveryman = await Deliveryman.findOne({ where: { email } });
    // checa se o usuário está cadastrado ou não
    if (!deliveryman) {
      return res.status(401).json({ error: 'User not found' });
    }

    // se chegou aqui é porque a senha e usuario estão corretos

    const { id, name } = deliveryman;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // retorno do token usando módulo jwt e trazendo as configurações do token do authConfig
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionDeliverymanController();
