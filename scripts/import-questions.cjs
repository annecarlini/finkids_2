#!/usr/bin/env node
/**
 * import-questions.js
 *
 * Roda localmente para importar os arquivos JSON em src/data/<Phase>/questions.json
 * para a tabela `quiz_questions` no MySQL.
 *
 * Configuração (por variáveis de ambiente):
 *  DB_HOST (default: localhost)
 *  DB_USER (default: root)
 *  DB_PASSWORD (default: empty)
 *  DB_NAME (default: db_integrador)
 *  DB_PORT (default: 3306)
 *  DRY_RUN (se definido, não executa INSERTs)
 *
 * Uso:
 *  # instalar dependência
 *  npm install mysql2
 *
 *  # executar (PowerShell):
 *  $env:DB_HOST='localhost'; $env:DB_USER='root'; $env:DB_PASSWORD='senha'; $env:DB_NAME='db_integrador'; node scripts/import-questions.js
 *
 * Observações:
 *  - O script assume que a tabela `quiz_questions` existe conforme o schema criado no Workbench.
 *  - Para evitar duplicatas, o script usa `external_id` no formato `${phase}-${q.id}`.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'db_integrador';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DRY_RUN = !!process.env.DRY_RUN;

async function main() {
  console.log('Importando perguntas de:', DATA_DIR);
  console.log('Conectando ao MySQL %s@%s:%s (db: %s) DRY_RUN=%s', DB_USER, DB_HOST, DB_PORT, DB_NAME, DRY_RUN);

  // conexão
  const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });

  const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  if (dirs.length === 0) {
    console.error('Nenhuma pasta de phase encontrada em', DATA_DIR);
    await conn.end();
    process.exit(1);
  }

  let inserted = 0;
  for (const phase of dirs) {
    const file = path.join(DATA_DIR, phase, 'questions.json');
    if (!fs.existsSync(file)) {
      console.log('[skip] sem questions.json em', phase);
      continue;
    }

    let raw;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (err) {
      console.error('erro lendo', file, err.message);
      continue;
    }

    let questions;
    try {
      questions = JSON.parse(raw);
    } catch (err) {
      console.error('arquivo JSON inválido:', file, err.message);
      continue;
    }

    for (const q of questions) {
      const externalId = `${phase}-${q.id}`;
      // checar duplicata por external_id
      const [rows] = await conn.execute('SELECT id FROM quiz_questions WHERE external_id = ?', [externalId]);
      if (rows.length > 0) {
        console.log('[exists] %s (external_id=%s) -> pulando', q.pergunta?.slice(0,40) || '<sem-pergunta>', externalId);
        continue;
      }

      const opcoes = q.opcoes ? JSON.stringify(q.opcoes) : JSON.stringify([]);
      const resposta = q.reposta_correta || q.resposta_correta || '';
      const quizId = q.quizId || null;
      const dificuldade = q.dificuldade != null ? q.dificuldade : null;
      const categoria = q.categoria || null;

      console.log('[inserir] external_id=%s quizId=%s pergunta=%s', externalId, quizId, (q.pergunta || '').slice(0,60));

      if (!DRY_RUN) {
        const sql = `INSERT INTO quiz_questions
          (phase, quiz_id, external_id, pergunta, opcoes, resposta_correta, source, approved, dificuldade, categoria)
          VALUES (?, ?, ?, ?, ?, ?, 'seed', TRUE, ?, ?)`;
        try {
          await conn.execute(sql, [phase, quizId, externalId, q.pergunta || '', opcoes, resposta, dificuldade, categoria]);
          inserted++;
        } catch (err) {
          console.error('erro inserindo', externalId, err.message);
        }
      }
    }
  }

  console.log('Import concluída. Inseridos:', inserted);
  await conn.end();
}

main().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
