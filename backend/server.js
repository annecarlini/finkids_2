/*
	server.js
	------------
	Ponto de entrada do backend Express (ESM). Responsabilidades:
	- Configurar middlewares globais (CORS com credenciais, helmet, rate limit,
		cookieParser, parser JSON).
	- Servir arquivos estáticos (assets e avatares).
	- Montar rotas da API: /api/auth, /api/avatars, /api (quizzes, progresso, etc.).
	- Verificação de saúde e inicialização opcional de migrações via db.init().

	Observações importantes:
	- FRONTEND deve fazer fetch/axios com `credentials: 'include'` para receber
		o cookie HttpOnly de refresh token usado pelo fluxo de autenticação.
	- Mantemos compatibilidade com paths usados pelo frontend (ex.: /avatars).
*/
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';
import avatarRoutes from './routes/avatarRoutes.js';
import db from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Configurar CORS permitindo credenciais (cookies HttpOnly) do frontend
// Defina FRONTEND_ORIGIN no .env se for diferente em desenvolvimento/produção
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Segurança de cabeçalhos HTTP
app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Muitas requisições, por favor tente novamente mais tarde.',
	skip: (req) => req.path.includes('/me/progress')
});
app.use(limiter);

// Servir arquivos estáticos de imagens (assets) para que o frontend possa
// usar URLs como /assets/AvatarN.png diretamente em <img src="..." />.
// Isso evita alterações no frontend: mantemos os arquivos em src/assets
// e o backend expõe essa pasta como rota estática.
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));

// Servir avatares do diretório público do backend: backend/public/avatars
// Recomenda-se mover os avatares para essa pasta em produção/dev para que o
// backend seja a fonte única de verdade para imagens de avatar.
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

// Rota compatibilizadora para /avatars/:file
// Alguns componentes do frontend usam /avatars/shadcn.jpg — garantimos que
// esse caminho funcione, servindo o arquivo correspondente em src/assets
// ou redirecionando para um asset existente.
app.get('/avatars/:file', (req, res) => {
	const { file } = req.params;
	const assetsDir = path.join(__dirname, '../src/assets');
	const candidate = path.join(assetsDir, file);
	if (fs.existsSync(candidate)) {
		return res.sendFile(candidate);
	}

	// fallback: se pedirem shadcn.jpg (exemplo do template), redirecionamos para
	// um asset existente (evita subir binários extras). Ajuste conforme preferir.
	if (file === 'shadcn.jpg') {
		return res.redirect('/assets/Avatar-frontpage.png');
	}

	return res.status(404).end();
});

// Compatibilidade com o proxy do Vite em modo de desenvolvimento:
// o Vite costuma reescrever /avatars -> /api/avatars (veja vite.config.ts).
// Para evitar 404s, expomos também /api/avatars/:file com a mesma lógica.
app.get('/api/avatars/:file', (req, res) => {
  const { file } = req.params;
  const assetsDir = path.join(__dirname, '../src/assets');
	const candidate = path.join(assetsDir, file);
  if (fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }

  if (file === 'shadcn.jpg') {
    return res.redirect('/assets/Avatar-frontpage.png');
  }

  return res.status(404).end();
});

// Middleware de log (desenvolvimento) - imprime método e URL sem dados sensíveis
app.use((req, res, next) => {
	// Não logar corpo de requisições para evitar exposição de dados sensíveis
	console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
	next();
});

app.use('/api', quizRoutes);
app.use('/api/auth', authRoutes);
// Alias para compatibilidade com o frontend atual que faz requests para
// "/auth/login" e "/auth/register" (sem o prefixo /api). Mantemos ambos
// montados temporariamente para evitar que o frontend que já está em uso
// quebre. Recomenda-se padronizar para /api/auth no futuro.
app.use('/auth', authRoutes);
app.use('/api/avatars', avatarRoutes);
import progressRoutes from './routes/progressRoutes.js';
app.use('/api', progressRoutes);
import rewardsRoutes from './routes/rewardsRoutes.js';
app.use('/api', rewardsRoutes);

app.get('/', (req, res) => res.json({ success: true, message: 'Finkids backend (JSON) running' }));

// Verificação de saúde: verifica conectividade com o banco e responde rapidamente
app.get('/api/healthz', async (req, res) => {
	try {
		await db.query('SELECT 1');
		return res.json({ success: true, status: 'ok' });
	} catch (err) {
		console.error('Erro na verificação de saúde do banco:', err);
		return res.status(500).json({ success: false, status: 'error', message: 'Falha na conexão com o banco' });
	}
});

const port = process.env.PORT || 4000;

// Opcional: inicializar tabelas se AUTO_MIGRATE=true
db.init().catch(err => console.error('Erro na inicialização do banco:', err));

app.listen(port, () => console.log(`Backend (ESM) rodando em http://localhost:${port}`));

// Tratador de erros — padroniza resposta JSON para erros não tratados
app.use((err, req, res, next) => {
	console.error('Erro não tratado:', err);
	const status = err.status || 500;
	res.status(status).json({ success: false, message: err.message || 'Erro interno do servidor' });
});

export default app;
