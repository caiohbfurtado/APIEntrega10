// middleware de autenticação para autorizar o usuário a alterar, deletar e buscar informações
import jwt from 'jsonwebtoken';
import { promisify } from 'util'; // função que permite usar async await
import authConfigDeliveryman from '../../config/authDeliveryman';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization; // busca na requisição um header de authorization que vai ser passado, que no caso é o token do usuário

  const [, token] = authHeader.split(' '); // como o authheader vem com a palavra Bearer junto, aqui estamos pegando somente o importante, que é o token

  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Token not provided!' });
  }

  try {
    const decoded = await promisify(jwt.verify)(
      token,
      authConfigDeliveryman.secret
    ); // retorna a data de criação e de expiração do token e o id do usuário caso estejam batendo as informações de segredo do token passado no bearer e no authConfig

    req.deliverymanId = decoded.id; // retornando para os controllers que se utilizam desse middleware o usuário que está logado

    return next(); // usuário autorizado a utilizar o controller seguinte
  } catch (error) {
    // token inválido
    return res.status(401).json({ error: 'Token invalid!' });
  }
};
