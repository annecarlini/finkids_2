import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// A coluna `progress` é um JSON que contém o estado de todas as fases,
// quizzes e recompensas do usuário. Ex: { phases: { Phase1: {...} }, quizzes: {...} }

// POST /api/users/me/progress
// Body: { phase: string, step_id?: string, progress?: object }
// Comportamento: faz merge no JSON existente para a chave phase e retorna o objeto consolidado
router.post('/me/progress',
  authenticate,
  [
    body('phase').isString().isLength({ min: 1 }).withMessage('phase inválido'),
    body('step_id').optional().isString(),
    body('progress').optional().isObject().withMessage('progress deve ser um objeto'),
  ],
  validateRequest,
  async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { phase, step_id, progress } = req.body || {};

    try {
      // 1) buscar registro atual (se existir)
      const rows = await db.query('SELECT progress FROM user_progress WHERE user_id = ?', [userId]);
      let current = {};
      if (rows && rows.length && rows[0].progress) {
        try { current = typeof rows[0].progress === 'object' ? rows[0].progress : JSON.parse(rows[0].progress); } catch (e) { current = {}; }
      }

      // garantir a estrutura base
      if (!current.phases || typeof current.phases !== 'object') current.phases = {};

      // atualizar/merge para a phase específica
      current.phases[phase] = {
        step_id: step_id || null,
        progress: progress || null,
        updated_at: new Date().toISOString()
      };

      // Upsert do registro consolidado por user_id
      const upsertSql = `INSERT INTO user_progress (user_id, progress)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE progress = VALUES(progress), updated_at = CURRENT_TIMESTAMP`;
      await db.query(upsertSql, [userId, JSON.stringify(current)]);

      return res.json({ success: true, progress: current });
    } catch (err) {
      console.error('Save consolidated progress error', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// GET /api/users/me/progress -> retorna o objeto consolidado de progresso do usuário
router.get('/me/progress', authenticate, async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const rows = await db.query('SELECT progress, updated_at FROM user_progress WHERE user_id = ? LIMIT 1', [userId]);
    if (!rows || !rows.length || !rows[0].progress) return res.json({ success: true, progress: {} });
    let progressObj = {};
    try { progressObj = typeof rows[0].progress === 'object' ? rows[0].progress : JSON.parse(rows[0].progress); } catch (e) { progressObj = {}; }
    return res.json({ success: true, progress: progressObj, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error('Get consolidated progress error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/progress - somente para o próprio usuário ou admin
router.get('/users/:id/progress', authenticate, async (req, res) => {
  const requesterId = req.user && req.user.id;
  const targetId = Number(req.params.id);
  if (!requesterId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    // verificar se requester é admin ou o próprio usuário
    const requesterRows = await db.query('SELECT tipo_usuario FROM users WHERE id = ?', [requesterId]);
    const requester = requesterRows && requesterRows.length ? requesterRows[0] : null;
    if (!requester) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (requesterId !== targetId && requester.tipo_usuario !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const rows = await db.query('SELECT progress, updated_at FROM user_progress WHERE user_id = ? LIMIT 1', [targetId]);
    if (!rows || !rows.length || !rows[0].progress) return res.json({ success: true, progress: {} });
    let progressObj = {};
    try { progressObj = typeof rows[0].progress === 'object' ? rows[0].progress : JSON.parse(rows[0].progress); } catch (e) { progressObj = {}; }
    return res.json({ success: true, progress: progressObj, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error('Get user consolidated progress error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
