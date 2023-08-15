'use strict';
const { Model, Sequelize } = require('sequelize');
const sequelize = require('./sequelize_client');

class BusLocation extends Model {}

BusLocation.init(
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    dataset_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    latitude: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    longitude: {
      type: Sequelize.DECIMAL,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'BusLocation',
    tableName: 'bus_locations'
  }
);

module.exports = sequelize.models.BusLocation;