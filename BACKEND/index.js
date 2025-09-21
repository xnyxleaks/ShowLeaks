// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');

const db = require('./models'); // deve exportar { sequelize, Sequelize, ... }
const { Umzug, SequelizeStorage } = require('umzug');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.set('trust proxy', 1);

// Sessão
app.use(session({
  name: 'sid',
  store: new pgSession({
    conString: process.env.POSTGRES_URL,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true
}));

// Body parser global exceto webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') return next();
  return express.json()(req, res, next);
});

// Rotas
const webhookRouter = require('./routes/webhook');
app.use('/webhook', webhookRouter);

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

const authRouter = require('./routes/auth');
const modelsRouter = require('./routes/models');
const contentRouter = require('./routes/content');
const reportsRouter = require('./routes/reports');
const i18nRouter = require('./routes/i18n');
const { router: ageVerificationRouter, ageVerificationMiddleware } = require('./routes/ageVerification');
const purchaseRouter = require('./routes/Purchase');
const billingRouter = require('./routes/Billing');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');
const { router: notificationsRouter } = require('./routes/notifications');
const adminRouter = require('./routes/admin');
const recommendationsRouter = require('./routes/recommendations');

app.use('/auth', authRouter);
app.use('/age-verification', ageVerificationRouter);
app.use('/i18n', i18nRouter);
app.use('/models', ageVerificationMiddleware, modelsRouter);
app.use('/content', ageVerificationMiddleware, contentRouter);
app.use('/reports', reportsRouter);
app.use('/purchase', purchaseRouter);
app.use('/billing', billingRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);
app.use('/notifications', notificationsRouter);
app.use('/admin', adminRouter);
app.use('/recommendations', recommendationsRouter);

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Postgres pool verificação básica
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Função de bootstrap: autentica, roda migrations e só então sobe o servidor
(async function bootstrap() {
  try {
    await pool.connect().then(c => { console.log('Conexão bem-sucedida ao banco de dados'); c.release(); });

    await db.sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Umzug configurado para usar a mesma storage do sequelize-cli (tabela SequelizeMeta)
    const umzug = new Umzug({
      migrations: { glob: path.join(__dirname, 'migrations', '*.js') },
      context: db.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: db.sequelize }),
      logger: console
    });

    const pending = await umzug.pending();
    if (pending.length) {
      console.log(`Executando ${pending.length} migration(s) pendente(s)...`);
      await umzug.up();
      console.log('Migrations aplicadas.');
    } else {
      console.log('Nenhuma migration pendente.');
    }

    // NÃO usar sync() quando há migrations, para evitar drift de esquema.
    // Se ainda desejar criar tabelas ausentes em dev, limite-se a:
    // await db.sequelize.sync({ force: false, alter: false });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Falha no bootstrap da aplicação:', err);
    process.exit(1); // falha rápida e explícita em caso de schema inválido
  }
})();
