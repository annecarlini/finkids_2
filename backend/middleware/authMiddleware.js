/*
  middleware/authMiddleware.js
  ----------------------------
  Middleware responsável por validar o access token JWT enviado pelo
  cliente no header Authorization: "Bearer <token>". Se válido, anexa o
  payload decodificado em req.user (campos mínimos: id, email, name).

  Observação: o token é emitido pelo authRoutes (login/register/refresh).
*/
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Carrega .env (se existir)
dotenv.config();

// Middleware que valida o token JWT enviado pelo cliente.
// Espera header: Authorization: Bearer <token>
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verifica e decodifica o token usando JWT_SECRET
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    // Anexa informações mínimas do usuário em req.user (id, email, name)
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
