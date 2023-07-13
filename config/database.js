// config/database.js

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',  // mysql, sqlite, postgres, mssql 중에서 선택
  // other options
});

module.exports = sequelize;
