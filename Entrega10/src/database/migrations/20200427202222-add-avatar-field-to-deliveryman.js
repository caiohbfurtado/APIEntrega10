// migration criada para criar a coluna avatar_id na tabela user e fazer o relacionamento entre as tabelas File e User
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'deliverymans', // tabela queestá sendo manipulada
      'avatar_id', // coluna que está sendo criada
      {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' }, // criando chave estrangeira passando a tabela da chave (model: files) e o nome do campo que vai receber (key: id)
        onUpdate: 'CASCADE', // se houver alteração do arquivo na tabela principal, haverá aqui também
        onDelete: 'SET NULL', // se a foto for deletada, o campo receberá null
        allowNull: true,
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('deliverymans', 'avatar_id');
  },
};
