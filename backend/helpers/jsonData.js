//Leitura de arquivos JSON (perguntas e respostas)
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajuste se necessário: backend/ espera que o projeto tenha 'src/data' na raiz
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');
const cache = new Map();

async function loadJsonFile(fullPath) {
  const raw = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(raw);
}

export async function loadQuestions(phase) {
  const key = `questions:${phase}`;
  if (cache.has(key)) return cache.get(key);

  const file = path.join(DATA_DIR, phase, 'questions.json');
  const arr = await loadJsonFile(file);
  cache.set(key, arr);
  return arr;
}

export async function loadSteps(phase) {
  const key = `steps:${phase}`;
  if (cache.has(key)) return cache.get(key);

  const file = path.join(DATA_DIR, phase, `stepsData${phase}.json`);
  const arr = await loadJsonFile(file);
  cache.set(key, arr);
  return arr;
}

export function clearCache(phase) {
  cache.delete(`questions:${phase}`);
  cache.delete(`steps:${phase}`);
}

export function listPhases() {
  // retorna os nomes dos diretórios em src/data
  return fs.readdir(DATA_DIR, { withFileTypes: true })
    .then(items => items.filter(d => d.isDirectory()).map(d => d.name));
}

export function findQuestion(questions, { id, external_id }) {
  if (external_id) {
    return questions.find(q => `${q.quizId ? q.quizId : ''}-${q.id}` === external_id || `${q.phase || ''}-${q.id}` === external_id || q.external_id === external_id);
  }
  return questions.find(q => q.id === Number(id));
}


export default {
  loadQuestions,
  loadSteps,
  clearCache,
  listPhases,
  findQuestion
};
