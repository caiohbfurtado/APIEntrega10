// arquvo de rotas da aplicação
import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import SessionDeliverymanController from './app/controllers/SessionDeliverymanController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import OrderForDeliverymanController from './app/controllers/OrderForDeliverymanController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import authUser from './app/middlewares/auth'; // busca o middleware para autorizar ou não o usuário de mexer nessa parte do sistema
import authDeliveryman from './app/middlewares/authDeliveryman'; // busca o middleware para autorizar ou não o usuário de mexer nessa parte do sistema

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store); // rota de criação de usuário

routes.post('/sessions/user', SessionController.store); // rota de inicio de sessão dos usuários administradores
routes.post('/sessions/deliveryman', SessionDeliverymanController.store); // rota de inicio de sessão dos usuários administradores

routes.get(
  '/deliveryman/deliveries',
  authDeliveryman,
  OrderForDeliverymanController.index
); // rota de listagem de entregas do entregador
routes.put(
  '/deliveryman/deliveries/:id',
  authDeliveryman,
  OrderForDeliverymanController.update
); // rota de alteração de entregas pelo entregador
routes.post(
  '/delivery/:id/problems',
  authDeliveryman,
  DeliveryProblemsController.store
); // rota de criação de problema em determinada entrega
routes.get(
  '/delivery/:id/problems',
  authDeliveryman,
  DeliveryProblemsController.index
); // rota de listagem de problemas de entrega de determinada entrega

routes.use(authUser); // a partir deste ponto, qualquer rota vai precisar de o usuário estar logado no sistema

routes.put('/users', UserController.update); // rota de alteração de usuários
routes.post('/recipients', RecipientController.store); // rota de criação de destinatário
routes.put('/recipients/:id', RecipientController.update); // rota de alteração de dados dos destinatários

routes.post('/files', upload.single('file'), FileController.store); // rota de upload de avatar

routes.post('/deliveryman', DeliverymanController.store); // rota de criação de entregadores
routes.put('/deliveryman/:id', DeliverymanController.update); // rota de alteração de entregadores
routes.get('/deliveryman', DeliverymanController.index); // rota de alteração de entregadores
routes.delete('/deliveryman/:id', DeliverymanController.delete); // rota de alteração de entregadores

routes.post('/orders', OrderController.store); // rota de criação de encomendas
routes.put('/orders/:id', OrderController.update); // rota de criação de encomendas
routes.get('/orders', OrderController.index); // rota de listagem de encomendas
routes.delete('/orders/:id', OrderController.delete); // rota para deletar encomendas

export default routes;
