const { Sequelize } = require('sequelize');
const databaseConfig = require('config');

const env = process.env.NODE_ENV;

let sequelize;
if (env === 'production') {
    sequelize = new Sequelize(databaseConfig);
} else {
    sequelize = new Sequelize('sqlite::memory');
}

module.exports = sequelize;