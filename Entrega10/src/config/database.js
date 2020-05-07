// por se conectar utilizando o sequelize, esse arquivo usa o module.exports ao invés de export default
module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'entrega10',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
