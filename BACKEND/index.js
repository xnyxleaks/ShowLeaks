const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./models');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();

app.use(cors());

// Configurar sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
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
const billingRouter = require('./routes/billing');

app.use('/auth', authRouter);
app.use('/age-verification', ageVerificationRouter);
app.use('/i18n', i18nRouter);

// Aplicar verificação de idade para rotas de conteúdo adulto
app.use('/models', ageVerificationMiddleware, modelsRouter);
app.use('/content', ageVerificationMiddleware, contentRouter);
app.use('/reports', reportsRouter);
app.use('/purchase', purchaseRouter);
app.use('/billing', billingRouter);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão bem-sucedida ao banco de dados');
  done();
});

db.sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return db.sequelize.sync({ alter: true });
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados Sequelize:', err);
  });

module.exports = app;
