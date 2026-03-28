const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Compliance = sequelize.define('Compliance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  complianceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('pass', 'fail'),
    defaultValue: 'fail'
  },
  wasteSeparation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  properBins: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  documentation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  training: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  suggestions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = Compliance;
