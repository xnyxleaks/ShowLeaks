'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const url = process.env.POSTGRES_URL || (cfg.use_env_variable ? process.env[cfg.use_env_variable] : null);

if (url) {
  sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // mescla opções do config.json se existirem
    ...(cfg.dialectOptions ? { dialectOptions: cfg.dialectOptions } : {}),
    ...(cfg.pool ? { pool: cfg.pool } : {}),
    
    ...(process.env.VERCEL ? {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000,
        evict: 1000
      }
    } : {})
  });
} else {
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port,
    dialect: cfg.dialect || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    ...(cfg.dialectOptions ? { dialectOptions: cfg.dialectOptions } : {}),
    ...(cfg.pool ? { pool: cfg.pool } : {}),
  });
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
