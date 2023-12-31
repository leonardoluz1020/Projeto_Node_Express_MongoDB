import NaoEncontrado from "../erros/NaoEncontrado.js";
import { autores, livros } from "../models/index.js";
import RequisicaoIncorreta from "../erros/RequisicaoIncorreta.js";

class LivroController {

  static async listarLivros(req, res, next) {
    try {
      let {limite = 5, pagina = 1,  ordenacao = "_id:-1"} = req.query;

      let [campoOrdenacao, ordem] = ordenacao.split(":");

      limite = parseInt(limite);
      pagina = parseInt(pagina);
      ordem = parseInt(ordem);
      
      if (limite > 0 && pagina > 0) {
        const listaLivros = await livros
          .find({})
          .sort({[campoOrdenacao]: ordem})
          .skip((pagina -1)*limite) 
          .limit(limite)
          .populate("autor")
          .exec();
        res.status(200).json(listaLivros); 
      } else {
        next(new RequisicaoIncorreta());
      }
    } catch (error) {
      next(error);
    }
  }

  static async listarLivroPorId(req, res, next) {
    try {
      const id = req.params.id;
      const livro_Por_Id = await livros.findById(id);
      if (livro_Por_Id !== null) {
        res.status(200).json(livro_Por_Id);
      } else {
        next(new NaoEncontrado("Id do Livro não foi encontrado."));
      }
    } catch (error) {
      next(error);
    }
  }

  static async cadastrarLivro(req, res, next) {
    try {
      const livroNovo = await livros.create(req.body);
      res.status(201).json({ message: "Criado com sucesso", livro: livroNovo });
    } catch (error) {
      next(error);
    }
  }

  static async atualizarLivro(req, res, next) {
    try {
      const id = req.params.id;
      const livroUpdate = await livros.findByIdAndUpdate(id, req.body);
      if (livroUpdate !== null) {
        res.status(201).json("Livro atualizado com sucesso !");
      } else {
        next(new NaoEncontrado("Id do Livro não foi encontrado."));
      }
    } catch (error) {
      next(error);
    }
  }

  static async excluirLivro(req, res, next) {
    try {
      const id = req.params.id;
      const livroDelete = await livros.findByIdAndDelete(id);
      if (livroDelete !== null) {
        res.status(201).json({ message: "Livro excluído com sucesso!" });
      } else {
        next(new NaoEncontrado("Id do Livro não foi encontrado."));
      }
    } catch (error) {
      next(error);
    }
  }

  static async listarLivrosPorFiltro(req, res, next) {
    try {
      const busca = await processaBusca(req.query);

      if (busca !== null) {
        const livroEditora = await livros
          .find(busca)
          .populate("autor");
        res.status(200).json(livroEditora);
      } else {
        res.status(200).json([]);
      }
    } catch (error) {
      next(error);
    }
  }
}

async function processaBusca(parametros){
  const { editora, titulo, minPaginas, maxPaginas, nomeAutor } = parametros;

  let busca = {};

  const regex = RegExp(titulo, "i");// Usando regex nativo do NodeJs.

  if (editora) busca.editora = { $regex: editora, $options: "i" };// Usando regex do mongoose.
  if (titulo) busca.titulo = regex;
  if(minPaginas || maxPaginas) busca.paginas = {};
  if(minPaginas) busca.paginas.$gte = minPaginas;
  if(maxPaginas) busca.paginas.$lte = maxPaginas;
  
  if(nomeAutor){
    const autor = await autores.findOne({nome: {$regex: nomeAutor, $options: "i"}});
    if(autor !== null){
      busca.autor = autor._id;
    }else {
      busca = null;
    }   
  }

  return busca;
}

export default LivroController;