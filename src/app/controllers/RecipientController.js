import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string(),
      number: Yup.number()
        .integer()
        .positive()
        .when('street', (street, field) => (street ? field.required() : field)),
      complement: Yup.string(),
      state: Yup.string().required().max(2),
      city: Yup.string().required(),
      zip_code: Yup.string().required().max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Fill in the data correctly' });
    }

    const { id, name, state, city, zip_code } = await Recipient.create(
      req.body
    );

    return res.json({
      id,
      name,
      city,
      state,
      zip_code,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number()
        .integer('Enter a integre number!')
        .positive('Enter a positive number!')
        .when('street', (street, field) => (street ? field.required() : field)),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zip_code: Yup.string().max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails!' });
    }

    const { id } = req.params; // recebe na url um id referente ao usuário que deve-se alterar
    const recipient = await Recipient.findByPk(id); // recebe os dados do destinatário com index informado acima

    const { name, state, city, zip_code } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      city,
      state,
      zip_code,
    });
  }
}

export default new RecipientController();
