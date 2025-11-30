/*
  routes/rewardsRoutes.js
  ----------------------
  Endpoints para gerenciar recompensas de usuário (user_rewards).
  - GET  /api/users/me/rewards    -> lista recompensas do usuário autenticado
  - GET  /api/users/:id/rewards   -> lista recompensas de um usuário (próprio ou admin)
  - POST /api/users/me/rewards    -> concede uma recompensa ao usuário (idempotente)

  O POST é transacional: insere em `user_rewards` (evita duplicatas) e atualiza
  o JSON `user_progress.progress` para manter um espelho rápido no objeto de progresso.
*/
import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// GET /api/users/me/rewards
router.get('/users/me/rewards', authenticate, async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const rows = await db.query(`SELECT ur.reward_id, r.nome, r.descricao, r.imagem, ur.data_conquista
      FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.id WHERE ur.user_id = ? ORDER BY ur.data_conquista DESC`, [userId]);
    return res.json({ success: true, rewards: rows });
  } catch (err) {
    console.error('Get my rewards error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/rewards - somente próprio user ou admin
router.get('/users/:id/rewards', authenticate, async (req, res) => {
  const requesterId = req.user && req.user.id;
  const targetId = Number(req.params.id);
  if (!requesterId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const requesterRows = await db.query('SELECT tipo_usuario FROM users WHERE id = ?', [requesterId]);
    const requester = requesterRows && requesterRows.length ? requesterRows[0] : null;
    if (!requester) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (requesterId !== targetId && requester.tipo_usuario !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const rows = await db.query(`SELECT ur.reward_id, r.nome, r.descricao, r.imagem, ur.data_conquista
      FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.id WHERE ur.user_id = ? ORDER BY ur.data_conquista DESC`, [targetId]);
    return res.json({ success: true, rewards: rows });
  } catch (err) {
    console.error('Get user rewards error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/me/rewards
// Body: { reward_id: number, reason?: string }
router.post('/users/me/rewards',
  authenticate,
  [ body('reward_id').isInt({ gt: 0 }).withMessage('reward_id inválido') ],
  validateRequest,
  async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { reward_id } = req.body || {};

    // Usaremos transação para garantir atomicidade entre user_rewards e user_progress
    const conn = await db.pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Verificar se a reward existe
      const [rewardRows] = await conn.query('SELECT id, nome, descricao, imagem FROM rewards WHERE id = ?', [reward_id]);
      if (!rewardRows || !rewardRows.length) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, message: 'Reward not found' });
      }
      const reward = rewardRows[0];

      // 2) Inserir em user_rewards 
      await conn.query('INSERT IGNORE INTO user_rewards (user_id, reward_id) VALUES (?, ?)', [userId, reward_id]);

      // 3) Atualizar o JSON consolidated progress (user_progress.progress)
      const [prRows] = await conn.query('SELECT progress FROM user_progress WHERE user_id = ? FOR UPDATE', [userId]);
      let progressObj = {};
      if (prRows && prRows.length && prRows[0].progress) {
        try { progressObj = typeof prRows[0].progress === 'object' ? prRows[0].progress : JSON.parse(prRows[0].progress); } catch (e) { progressObj = {}; }
      }

      if (!progressObj.rewards || typeof progressObj.rewards !== 'object') progressObj.rewards = { items: [], coins: 0 };
      // evitar duplicatas no array de items
      if (!progressObj.rewards.items.includes(reward_id)) progressObj.rewards.items.push(reward_id);

      // Upsert do registro consolidado por user_id
      await conn.query(`INSERT INTO user_progress (user_id, progress)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE progress = VALUES(progress), updated_at = CURRENT_TIMESTAMP`, [userId, JSON.stringify(progressObj)]);

      await conn.commit();
      conn.release();

      return res.json({ success: true, reward, progress: progressObj });
    } catch (err) {
      console.error('Award reward error', err);
      try { await conn.rollback(); } catch (e) {}
      conn.release();
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
