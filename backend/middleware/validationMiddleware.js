/*
  middleware/validationMiddleware.js
  ----------------------------------
  Pequeno wrapper sobre express-validator para padronizar a resposta de
  erro de validação. Em caso de erros retorna 400 com JSON:
    { success: false, errors: [ { param, msg, value }, ... ] }

  Uso: adicionar validações (body/param/query) nas rotas e depois usar
  validateRequest como middleware para que os erros sejam tratados aqui.
*/
import { validationResult } from 'express-validator';

// Middleware para verificar o resultado das validações do express-validator
// Retorna 400 com um array de erros no formato { param, msg, value }
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extracted = errors.array().map(err => ({ param: err.param, msg: err.msg, value: err.value }));
  return res.status(400).json({ success: false, errors: extracted });
}

export default validateRequest;
