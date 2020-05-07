// migration de criação de tabela entregas no bd entrega10
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        references: { model: 'recipients', key: 'id' }, // criando chave estrangeira passando a tabela da chave (model: recipients) e o nome do campo que vai receber (key: id)
        onUpdate: 'CASCADE', // se houver alteração na data na tabela principal, haverá aqui também
        onDelete: 'SET NULL', // se o agendamento for deletada, o campo receberá null
        allowNull: false,
      },
      deliveryman_id: {
        type: Sequelize.INTEGER,
        references: { model: 'deliverymans', key: 'id' }, // criando chave estrangeira passando a tabela da chave (model: recipients) e o nome do campo que vai receber (key: id)
        onUpdate: 'CASCADE', // se houver alteração na data na tabela principal, haverá aqui também
        onDelete: 'SET NULL', // se o agendamento for deletada, o campo receberá null
        allowNull: false,
      },
      signature_id: {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' }, // criando chave estrangeira passando a tabela da chave (model: files) e o nome do campo que vai receber (key: id)
        onUpdate: 'CASCADE', // se houver alteração do arquivo na tabela principal, haverá aqui também
        onDelete: 'SET NULL', // se a foto for deletada, o campo receberá null
        allowNull: true,
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      canceled_at: {
        type: Sequelize.DATE,
      },
      start_date: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('orders');
  },
};
