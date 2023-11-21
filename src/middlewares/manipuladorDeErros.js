import mongoose from "mongoose";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros(error, req, res, next) {
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Um ou mais dados fornecido estão incorretos." });
  } else if (error instanceof mongoose.Error.ValidationError) {
    const mensagensErro = Object.values(error.errors)
      .map(erro => erro.message)
      .join("; "); 
    res.status(400).json({message: `O seguintes erros foram encontrados: ${mensagensErro}`});
  } else {
    res.status(500).json({ message: `${error.message} - Falha ao solicitar dados por id` });
  }
}

export default manipuladorDeErros; 