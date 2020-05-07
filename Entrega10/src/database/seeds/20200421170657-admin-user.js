// seed de criação de usuário admin
const bcrypt = require('bcrypt');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Distribuidora Entrega10',
          email: 'admin@entrega10.com',
          password_hash: bcrypt.hashSync('123456', 8),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
