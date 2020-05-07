// controller de maniulação do upload de fotos
import File from '../models/File';

class FileController {
  async store(req, res) {
    const { filename: path, originalname: name } = req.file; // recebendo os dados da requisição file e alterando os nomes de como vem para como serão recebidos no BD

    const file = await File.create({ path, name });

    return res.json(file);
  }
}

export default new FileController();
