/*
  db.js
  -----
  Camada de acesso ao banco usando mysql2/promise. Exporta:
  - pool: o pool de conexões (não usar diretamente, preferir query())
  - query(sql, params): auxiliar para executar prepared statements e retornar linhas
  - init(): função opcional que executa o arquivo SQL `backend/sql/init.sql`
    quando a variável de ambiente AUTO_MIGRATE=true. Útil em desenvolvimento, mas cuidado
    em produção (faça backup antes de ativar).

  Nota: `multipleStatements: true` está habilitado para permitir execução do
  arquivo SQL com várias instruções; é conveniente para desenvolvimento, porém em produção
  prefira migrações controladas.
*/
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente de um arquivo .env (se existir)
dotenv.config();

// Cria um pool de conexões com o MySQL usando mysql2/promise
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_integrador',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true, // necessário para executar o arquivo SQL com múltiplas instruções
});

// Função utilitária para executar consultas (prepared statements)
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// init(): executa migrações automáticas se AUTO_MIGRATE=true
// Observação: o script backend/sql/init.sql contém o DDL completo do schema.
async function init() {
  if (process.env.AUTO_MIGRATE !== 'true') {
    console.log('AUTO_MIGRATE não habilitado; pulando migrações automáticas');
    return;
  }

  console.log('Executando migrações do banco (AUTO_MIGRATE=true)');
  // ler arquivo SQL e executar
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const sqlPath = path.join(__dirname, 'sql', 'init.sql');
  let sqlContent = '';
  try {
    sqlContent = fs.readFileSync(sqlPath, { encoding: 'utf-8' });
  } catch (err) {
    console.error('Não foi possível ler init.sql:', err);
    throw err;
  }

  try {
    // Executa todo o conteúdo do SQL (múltiplas instruções)
    await pool.query(sqlContent);
    console.log('Migrações do banco concluídas (init.sql executado)');
  } catch (err) {
    console.error('Erro ao executar init.sql:', err);
    throw err;
  }
}

export default {
  pool,
  query,
  init,
};
