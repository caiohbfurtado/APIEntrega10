import * as Yup from 'yup'; // biblioteca de validações
import User from '../models/User';

class UserController {
  async store(req, res) {
    // configurando o tipo de dado que vai chegar pelo req.body
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    // verificando se os dados passados no req.body estão de fato de acordo com as configuraçõs acima
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }
    // verifica se o email do usuário  informado no frontend já consta no bd
    const userExists = await User.findOne({ where: { email: req.body.email } });

    // caso o usuário já esteja cadastrado, volta mensagem de erro
    if (userExists)
      return res.status(400).json({ error: 'User already exists.' });

    // senão o usuário é criado dentro do Model User com os campos informados no frontend id, name, email e os de padrão do sequelize createdat updatedat
    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    // configurando o tipo de dado que vai chegar pelo req.body
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6).required(),
      password: Yup.string().min(6),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ), // se o usuário passar uma nova senha, o campo confirmPassword torna-se obrigatório e deverá ser igual ao newPassword
    });

    // a senha sempre vai ser necessária para qualquer alteração de dados informada pelo usuário, aqui é a validação se ela está sendo informada ou não
    if (!req.body.oldPassword) {
      return res.status(400).json({ error: 'Password required!' });
    }

    // verificando se os dados passados no req.body estão de fato de acordo com as configuraçõs acima
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // req.userId contém o id do usuário logado
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId); // jogando na variável user os dados do Model com a pk trazida pela sessão

    // verifica se o usuário está de fato tentando modificar o email
    if (email && email !== user.email) {
      // verifica se o email do usuário  informado no frontend já consta no bd
      const userExists = await User.findOne({
        where: { email },
      });

      // caso o usuário já esteja cadastrado, volta mensagem de erro
      if (userExists)
        return res.status(400).json({ error: 'User already exists.' });
    }

    // verifica se a senha antiga bate com a senha já cadastrada no bd
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // fazendo atualização dos dados passados no frontend
    const { name, id } = await user.update(req.body);

    return res.json({ name, id });
  }
}

export default new UserController();
