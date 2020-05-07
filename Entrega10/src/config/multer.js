// configuração da parte de uploads de arquivos
import multer from 'multer'; // dependência que permite trabalharmos com arquivos diferentes do json para envio ao bd
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // configura a froma que o multer vai guardar os arquivos. nesse caso vamos guardar os arquivos dentro da própria pasta da aplicação
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'), // destino dos arquivos
    // padroniza o nome dos arquivos a serem salvos para que eles sejam unicos
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return callback(err);

        // caso dê certo, o arquivo receberá um código hexadcimal + a extensão do arquivo original
        return callback(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
