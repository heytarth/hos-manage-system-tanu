const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalWaste: DataTypes.FLOAT,
  byCategory: {
    type: DataTypes.JSON,
    defaultValue: {
      general: 0,
      infectious: 0,
      chemical: 0,
      radioactive: 0,
      pharmaceutical: 0
    }
  },
  recyclingPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Analytics;
