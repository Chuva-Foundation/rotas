const { Sequelize } = require('sequelize');
const databaseConfig = require('config/database');

const env = process.env.NODE_ENV;

let sequelize;
if (env !== 'production') {
    sequelize = new Sequelize(databaseConfig[env]);
} else {
    sequelize = new Sequelize(databaseConfig['production']);
}

module.exports = sequelize;