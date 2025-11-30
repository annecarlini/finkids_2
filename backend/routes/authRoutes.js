/*
  routes/authRoutes.js
  ---------------------
  Endpoints relacionados à autenticação:
  - POST /api/auth/register : criar usuário (hash bcrypt), gerar access token + refresh cookie
  - POST /api/auth/login    : autenticar usuário, gerar tokens
  - POST /api/auth/refresh  : renovar access token usando refresh token em cookie HttpOnly
  - POST /api/auth/logout   : revogar refresh token atual
  - GET  /api/auth/me       : retorna dados do usuário autenticado


*/
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { authenticate } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

dotenv.config();

// Configurações para refresh tokens
const REFRESH_TOKEN_DAYS = process.env.REFRESH_TOKEN_DAYS ? Number(process.env.REFRESH_TOKEN_DAYS) : 30;
const REFRESH_TOKEN_EXPIRES_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'refreshToken';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_TOKEN_EXPIRES_MS,
    path: '/api', // enviar cookie apenas para rotas /api
  };
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

const router = express.Router();

// --------------------------------------------------
// Helper: mapear user DB -> formato esperado pelo frontend
// Também garante que o campo avatar seja uma URL pública
// (ex.: '/assets/AvatarN.png') para consumo direto pelo browser.
// --------------------------------------------------
function toPublicAssetPath(caminho) {
  if (!caminho) return caminho;
  const normalized = caminho.replace(/\\/g, '/');
  if (normalized.startsWith('src/assets/')) {
    // retornar caminho relativo para que o frontend (via proxy) o resolva
    return normalized.replace(/^src\/assets\//, '/avatars/');
  }
  if (normalized.startsWith('/assets/')) {
    return normalized.replace(/^\/assets\//, '/avatars/');
  }
  return normalized;
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nome || row.name,
    email: row.email,
    avatar: toPublicAssetPath(row.caminho_imagem || row.image_url || null),
    tipo_usuario: row.tipo_usuario || null,
  };
}

// POST /api/auth/register
// Registra um usuário e retorna token + user (mapeado)
router.post('/register',
  // validação dos campos de registro
  [
    body('name').isString().isLength({ min: 2 }).withMessage('Nome inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  ],
  validateRequest,
  async (req, res) => {
    const { name, email, password, tipo_usuario } = req.body || {};

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length) return res.status(409).json({ success: false, message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.query('INSERT INTO users (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)', [name, email, hash, tipo_usuario || 'child']);

    // buscar usuário criado junto com caminho do avatar (se houver)
    const userRows = await db.query(`SELECT u.id, u.nome, u.email, u.avatar_id, a.caminho_imagem
      FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.email = ?`, [email]);
    const user = userRows && userRows[0] ? mapUserRow(userRows[0]) : null;

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    // criar refresh token e salvar no DB
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [user.id, tokenHash, expiresAt]);
    setRefreshCookie(res, refreshToken);
    return res.json({ success: true, token, user });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
// Autentica o usuário e retorna token + user (mapeado)
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isString().withMessage('Senha inválida'),
  ],
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body || {};

  try {
    const rows = await db.query(`SELECT u.id, u.nome, u.email, u.senha_hash, u.avatar_id, a.caminho_imagem, u.tipo_usuario
      FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.email = ?`, [email]);
    const dbUser = rows && rows.length ? rows[0] : null;
    if (!dbUser) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, dbUser.senha_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = mapUserRow(dbUser);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    // gerar refresh token e gravar
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [user.id, tokenHash, expiresAt]);
    setRefreshCookie(res, refreshToken);
    return res.json({ success: true, token, user });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/refresh - renova access token usando refresh token (cookie HttpOnly)
router.post('/refresh', async (req, res) => {
  try {
    const rt = req.cookies && req.cookies[COOKIE_NAME];
    if (!rt) return res.status(401).json({ success: false, message: 'Missing refresh token' });
    const tokenHash = hashToken(rt);
    const rows = await db.query('SELECT id, user_id, expires_at, revoked FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
    const row = rows && rows.length ? rows[0] : null;
    if (!row || row.revoked) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    if (new Date(row.expires_at) < new Date()) return res.status(401).json({ success: false, message: 'Refresh token expired' });

    // buscar usuário e emitir novo access token
    const userRows = await db.query('SELECT id, nome, email FROM users WHERE id = ?', [row.user_id]);
    const userRow = userRows && userRows.length ? userRows[0] : null;
    if (!userRow) return res.status(404).json({ success: false, message: 'User not found' });
    const user = { id: userRow.id, name: userRow.nome, email: userRow.email };
    const newAccess = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    // opcional: rotacionar refresh token
    const newRefresh = crypto.randomBytes(64).toString('hex');
    const newHash = hashToken(newRefresh);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);
    // insere novo e marca antigo como revoked
    await db.query('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [row.id]);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [user.id, newHash, newExpiresAt]);
    setRefreshCookie(res, newRefresh);

    return res.json({ success: true, token: newAccess, user });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout - revoga refresh token atual.
// Aceitamos logout mesmo quando o access token não for enviado: priorizamos
// a presença do cookie de refresh token para identificar e revogar.
router.post('/logout', async (req, res) => {
  try {
    const rt = req.cookies && req.cookies[COOKIE_NAME];
    if (rt) {
      const tokenHash = hashToken(rt);
      await db.query('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [tokenHash]);
      res.clearCookie(COOKIE_NAME, { path: '/api' });
      return res.json({ success: true });
    }

    // Se não houver cookie de refresh, tentar usar o access token (se enviado)
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const access = authHeader.slice(7);
        const payload = jwt.verify(access, process.env.JWT_SECRET || 'dev_secret');
        const userId = payload && payload.id;
        if (userId) {
          await db.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
          res.clearCookie(COOKIE_NAME, { path: '/api' });
          return res.json({ success: true });
        }
      } catch (err) {
        // token inválido — apenas prosseguir para limpar cookie se houver
      }
    }

    // Sem cookie nem access token válido: limpar cookie (se houver) e retornar sucesso
    res.clearCookie(COOKIE_NAME, { path: '/api' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me - retorna o usuário autenticado
router.get('/me', authenticate, async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const rows = await db.query(`SELECT u.id, u.nome, u.email, u.avatar_id, a.caminho_imagem, a.public_url, u.tipo_usuario
      FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.id = ?`, [userId]);
    const row = rows && rows.length ? rows[0] : null;
    if (!row) return res.status(404).json({ success: false, message: 'User not found' });

    const avatar = row.public_url || toPublicAssetPath(row.caminho_imagem || null);
    const user = { id: row.id, name: row.nome, email: row.email, avatar, tipo_usuario: row.tipo_usuario };
    return res.json({ success: true, user });
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

