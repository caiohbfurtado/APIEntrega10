import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcrypt'; // módulo de criptografia de senha

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        // dados que podem ser informados no front-end
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL, // Virtual significa que o campo só vai existir no front-end, pois depois vai ser criptografado antes de cair no banco de dados
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    // hook usado para criptografar a senha informada no frontend
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hashSync(user.password, 8);
      }
    });

    return this;
  }

  // função para checar se a senha informada no SessionController bate com a do banco
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
