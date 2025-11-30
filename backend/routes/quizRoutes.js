/*
  routes/quizRoutes.js
  --------------------
  Rotas que servem conteúdo das fases e quizzes com base em arquivos
  JSON em `backend/data/*` (via helper `jsonData`).


*/
import express from 'express';
import jsonData from '../helpers/jsonData.js';
import { normalizeAnswer } from '../helpers/normalize.js';
import { authenticate } from '../middleware/authMiddleware.js';
import db from '../db.js';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// GET /api/phases -> lista fases 
router.get('/phases', async (req, res) => {
  try {
    const phases = await jsonData.listPhases();
    res.json(phases);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro listando fases', error: err.message });
  }
});

// GET /api/phases/:phase/steps
router.get('/phases/:phase/steps', async (req, res) => {
  const { phase } = req.params;
  try {
    const steps = await jsonData.loadSteps(phase);
    res.json(steps);
  } catch (err) {
    res.status(404).json({ success: false, message: `Steps for phase ${phase} not found`, error: err.message });
  }
});

// GET /api/phases/:phase/questions?quizId=quiz1
router.get('/phases/:phase/questions', async (req, res) => {
  const { phase } = req.params;
  const { quizId } = req.query;
  try {
    const questions = await jsonData.loadQuestions(phase);
    let filtered = questions;
    if (quizId) filtered = questions.filter(q => q.quizId === quizId);
    // remove gabarito antes de enviar
    const withoutKey = filtered.map(q => {
      // aceitar nomes distintos (resposta_correta, reposta_correta) e removê-los
      const { resposta_correta: __r, reposta_correta: __rr, ...rest } = q;
      return rest;
    });
    res.json(withoutKey);
  } catch (err) {
    res.status(404).json({ success: false, message: `Questions for phase ${phase} not found`, error: err.message });
  }
});

// POST /api/quizzes/check
// Body: { phase, questionId, external_id?, selectedOption }
router.post('/quizzes/check', async (req, res) => {
  const { phase, questionId, external_id, selectedOption } = req.body;
  if (!phase || (!questionId && !external_id) || selectedOption == null) {
    return res.status(400).json({ success: false, message: 'phase + questionId/external_id + selectedOption required' });
  }

  try {
    const questions = await jsonData.loadQuestions(phase);
    let q;
    if (external_id) {
      q = questions.find(x => `${phase}-${x.id}` === external_id || x.external_id === external_id || `${x.quizId || ''}-${x.id}` === external_id);
    } else {
      q = questions.find(x => x.id === Number(questionId));
    }
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });

    // normalizar antes de comparar para evitar falsos negativos por acento/case/spaces
    const given = normalizeAnswer(selectedOption);
    const rawAnswer = q.reposta_correta || q.resposta_correta || q.resposta;
    const answer = normalizeAnswer(rawAnswer || '');
    const correct = given === answer;
    // opcional: registrar resultado em arquivo ou DB
    res.json({ success: true, correct, points: correct ? 1 : 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error checking answer', error: err.message });
  }
});

// POST /api/quizzes/:quizId/results
// Body: { score, total_acertos, tempo_gasto, detalhes }
router.post('/quizzes/:quizId/results',
  authenticate,
  [
    param('quizId').isString().withMessage('quizId inválido'),
    body('score').isInt().withMessage('score deve ser inteiro'),
    body('total_acertos').isInt().withMessage('total_acertos deve ser inteiro'),
    body('tempo_gasto').optional().isInt().withMessage('tempo_gasto deve ser inteiro'),
  ],
  validateRequest,
  async (req, res) => {
  const { quizId } = req.params;
  const { score, total_acertos, tempo_gasto, detalhes } = req.body || {};
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query('INSERT INTO quiz_results (user_id, quiz_id, score, total_acertos, tempo_gasto, detalhes) VALUES (?, ?, ?, ?, ?, ?)', [userId, quizId, score, total_acertos, tempo_gasto || 0, JSON.stringify(detalhes || null)]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Save quiz result error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/results - retorna resultados do usuário (somente o próprio user ou admin)
router.get('/users/:id/results', authenticate, async (req, res) => {
  const targetId = Number(req.params.id);
  const requesterId = req.user && req.user.id;
  if (!requesterId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    // permite acesso se for o próprio usuário ou admin
    const requesterRows = await db.query('SELECT tipo_usuario FROM users WHERE id = ?', [requesterId]);
    const requester = requesterRows && requesterRows.length ? requesterRows[0] : null;
    if (!requester) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (requesterId !== targetId && requester.tipo_usuario !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const rows = await db.query('SELECT id, quiz_id, score, total_acertos, tempo_gasto, detalhes, data FROM quiz_results WHERE user_id = ? ORDER BY data DESC', [targetId]);
    return res.json({ success: true, results: rows });
  } catch (err) {
    console.error('Get user results error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
