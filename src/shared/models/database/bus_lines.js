'use strict';
const { Model, Sequelize } = require('sequelize');
const sequelize = require('./sequelize_client');

class BusLocation extends Model {}

BusLocation.init(
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    latitude: {
      type: Sequelize.DECIMAL,
      allowNull: false
    },
    longitude: {
      type: Sequelize.DECIMAL,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'BusLocation',
    tableName: 'bus_locations'
  }
);

module.exports = sequelize.models.BusLocation;