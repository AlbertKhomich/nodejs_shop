const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'hdJAFM9qRX2cjz', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
