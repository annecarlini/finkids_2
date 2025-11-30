# Backend Finkids - Sistema de Educação Financeira Gamificado

Backend completo em Node.js (ESM) com Express, MySQL e autenticação JWT para o projeto Finkids.

## 🎯 Funcionalidades Principais

### Sistema de Autenticação
- Registro e login com JWT (7 dias de validade)
- Bcrypt para hash de senhas
- Refresh tokens com HttpOnly cookies
- Middleware de autenticação para rotas protegidas

### Sistema de Moedas e Gamificação
- **+25 moedas** por resposta correta nos quizzes
- Acumulação persistente através das fases
- Sistema de orçamento no Mercadinho (moedas gastas não retornam)
- Requisito de **200 moedas** para acessar missões de jogo

### Sistema de Pontos de Foco
- Pontuação baseada em escolhas financeiras:
  - Escolha boa (verde): **10 pontos**
  - Escolha média (amarela): **5 pontos**
  - Escolha ruim (vermelha): **0 pontos**
- Tracking persistente por usuário

### Gestão de Progresso
- Armazenamento JSON de progresso por usuário
- Tracking de fases completadas
- Histórico de compras no Mercadinho
- Pontuação e moedas por fase

## 📁 Estrutura de Arquivos

```
backend/
├── server.js              # Ponto de entrada, configuração Express
├── db.js                  # Conexão MySQL e query helper
├── routes/
│   ├── authRoutes.js      # Login, registro, refresh token
│   ├── quizRoutes.js      # Perguntas e validação de respostas
│   ├── progressRoutes.js  # GET/POST progresso do usuário
│   ├── avatarRoutes.js    # Gestão de avatares
│   └── rewardsRoutes.js   # Sistema de recompensas
├── middleware/
│   ├── authMiddleware.js  # Verificação JWT
│   └── validationMiddleware.js
├── helpers/
│   ├── jsonData.js        # Carregamento de perguntas JSON
│   └── normalize.js       # Normalização de dados
└── sql/
    └── init.sql           # Schema completo do banco
```

## 🚀 Como Executar

### 1. Instalar Dependências

```powershell
npm install
```

Dependências principais:
- express
- mysql2
- jsonwebtoken
- bcryptjs
- cors
- helmet
- express-rate-limit
- cookie-parser
- express-validator

### 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=db_integrador
JWT_SECRET=seu_secret_jwt_aqui
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
AUTO_MIGRATE=true
```

Execute o schema SQL:

```powershell
mysql -u root -p < backend/sql/init.sql
```

### 3. Iniciar o Servidor

```powershell
# Na raiz do projeto
node backend/server.js
```

Ou use o script PowerShell:

```powershell
.\dev-backend.ps1
```

O servidor iniciará em `http://localhost:3000`

## 🔐 Endpoints da API

### Autenticação

```http
POST /api/auth/register
Body: { "name": "Nome", "email": "email@exemplo.com", "password": "senha123", "tipo_usuario": "child" }

POST /api/auth/login
Body: { "email": "email@exemplo.com", "password": "senha123" }
Response: { "success": true, "token": "jwt...", "user": {...} }

GET /api/auth/me
Headers: { "Authorization": "Bearer jwt..." }
Response: { "success": true, "user": {...} }
```

### Progresso (Requer autenticação)

```http
GET /api/me/progress
Headers: { "Authorization": "Bearer jwt..." }
Response: { "success": true, "progress": {...} }

POST /api/me/progress
Headers: { "Authorization": "Bearer jwt..." }
Body: { "progress": { "phase1": {...}, "mercadinho": {...} } }
```

### Quizzes

```http
GET /api/phases/Phase1/questions?quizId=quiz1
Response: { "success": true, "questions": [...] }

POST /api/quizzes/check
Body: { "phase": "Phase1", "external_id": "Phase1-1", "selectedOption": "Resposta" }
Response: { "success": true, "correct": true }
```

### Avatares

```http
GET /api/avatars
Response: { "success": true, "avatars": [...] }

POST /api/avatars/select
Headers: { "Authorization": "Bearer jwt..." }
Body: { "avatarId": 1 }
```

## 🔒 Segurança

- **Rate Limiting**: 100 requisições por 15 minutos
- **Helmet**: Headers HTTP seguros
- **CORS**: Configurado para frontend específico
- **Logs sanitizados**: Dados de autenticação não aparecem nos logs
- **Bcrypt**: Salt rounds = 10 para hash de senhas
- **JWT**: Tokens expiram em 7 dias

## 📊 Schema do Banco de Dados

Tabelas principais:
- `users` - Usuários (child, parent, admin)
- `user_progress` - Progresso JSON por usuário
- `avatars` - Avatares disponíveis
- `rewards` - Sistema de recompensas
- `user_rewards` - Recompensas conquistadas
- `quiz_questions` - Perguntas dos quizzes
- `quiz_results` - Histórico de tentativas
- `refresh_tokens` - Tokens de refresh

## 🎮 Sistema de Economia

### Ganhar Moedas
- Cada resposta correta no quiz = +25 moedas
- Moedas acumulam através das fases
- Persistência no banco via `user_progress`

### Gastar Moedas
- Mercadinho: itens custam 25-100 moedas
- Moedas gastas são subtraídas permanentemente
- Campo `spentCoins` no progresso do Mercadinho

### Acesso a Missões
- Requer mínimo de 200 moedas
- Bloqueio visual com indicador de progresso
- Desbloqueio automático ao atingir requisito

## 🐛 Troubleshooting

**Erro 403 nas rotas de progresso:**
- Verifique se o token JWT está no header: `Authorization: Bearer seu_token`

**Erro 429 Too Many Requests:**
- Rate limiter configurado para 100 req/15min
- Rotas `/me/progress` são excluídas do rate limit

**Senha não salva:**
- O frontend deve usar `credentials: 'include'` no fetch
- Verifique se o CORS está configurado corretamente

**Moedas não acumulando:**
- Verifique se o POST para `/api/me/progress` está salvando o JSON completo
- Confirme que `onCoinsUpdate()` é chamado após salvar

## 📝 Observações

- O backend lê perguntas de `src/data` (JSONs do frontend)
- Respostas corretas nunca são enviadas ao frontend
- Todas as validações são feitas no servidor
- Logs em português para facilitar debug
- Código totalmente comentado em português