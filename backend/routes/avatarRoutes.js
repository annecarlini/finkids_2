/*
  routes/avatarRoutes.js
  ----------------------
  Endpoints para listar e escolher avatares. Retornamos URLs públicas
  (campo `public_url`) para que o frontend possa consumir diretamente.
*/
import express from 'express';
import db from '../db.js';
import path from 'path';
import { authenticate } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

// Router responsável pelos endpoints de avatar
// Observação: não mexemos no frontend — aqui asseguramos que o backend
// retorne URLs públicas (começando por /assets/) para que <img src="..."/>
// funcione sem alterações no cliente.
const router = express.Router();

// Helper: transforma caminhos do tipo 'src/assets/AvatarN.png' em
// '/assets/AvatarN.png' para serem consumidos diretamente pelo browser.
function toPublicAssetPath(caminho) {
  // Retornamos caminhos relativos do tipo '/avatars/Avatar.png'
  // Isso evita problemas com portas/hosts diferentes e funciona com o proxy do Vite
  if (!caminho) return caminho;
  const normalized = caminho.replace(/\\/g, '/');
  if (normalized.startsWith('src/assets/')) {
    return normalized.replace(/^src\/assets\//, '/avatars/');
  }
  if (normalized.startsWith('/assets/')) {
    return normalized.replace(/^\/assets\//, '/avatars/');
  }
  return normalized;
}

// GET /api/avatars - listar avatares (simples: id, nome, caminho_imagem)
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT id, nome, caminho_imagem, public_url FROM avatars ORDER BY id');
    // mapear caminho_imagem para URL pública /avatars/... e também retornar o caminho original
    const avatars = rows.map(r => {
      // Se a coluna public_url já estiver preenchida, usa ela.
      // Senão, monta /avatars/<basename> a partir do caminho_imagem.
      const publicUrl = r.public_url && r.public_url.trim()
          ? r.public_url
          : '/avatars/' + path.basename(r.caminho_imagem || '');
      return {
        id: r.id,
        nome: r.nome,
        caminho_imagem: r.caminho_imagem,
        public_url: publicUrl
      };
    });
    
    // Deduplicate by basename to prevent duplicate avatars with similar paths
    const seenBasenames = new Map();
    const uniqueAvatars = [];
    for (const avatar of avatars) {
      const basename = path.basename(avatar.public_url || avatar.caminho_imagem || '');
      if (!seenBasenames.has(basename)) {
        seenBasenames.set(basename, true);
        uniqueAvatars.push(avatar);
      }
    }
    
    return res.json({ success: true, avatars: uniqueAvatars });
  } catch (err) {
    console.error('Get avatars error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/avatars/choose - escolhe avatar para o usuário autenticado
router.post('/choose',
  authenticate,
  [ body('avatar_id').isInt({ gt: 0 }).withMessage('avatar_id inválido') ],
  validateRequest,
  async (req, res) => {
  const userId = req.user && req.user.id;
  const { avatar_id } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    // verificar se avatar existe
    const rows = await db.query('SELECT id, caminho_imagem FROM avatars WHERE id = ?', [avatar_id]);
    if (!rows || !rows.length) return res.status(404).json({ success: false, message: 'Avatar not found' });

    await db.query('UPDATE users SET avatar_id = ? WHERE id = ?', [avatar_id, userId]);
    const userRows = await db.query(`SELECT u.id, u.nome, u.email, u.avatar_id, a.caminho_imagem
      FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.id = ?`, [userId]);
    const userRow = userRows && userRows[0] ? userRows[0] : null;
    const avatarPublic = userRow && userRow.caminho_imagem ? toPublicAssetPath(userRow.caminho_imagem) : null;
    const user = userRow ? { id: userRow.id, name: userRow.nome, email: userRow.email, avatar: avatarPublic } : null;
    return res.json({ success: true, user });
  } catch (err) {
    console.error('Choose avatar error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
