// arquivo de configuração do servidor
import express from 'express';
import path from 'path';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    ); // middleware para poder acessar arquivos que serão retornados para o front-end
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App();