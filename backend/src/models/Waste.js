const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Waste = sequelize.define('Waste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'kg'
  },
  category: {
    type: DataTypes.ENUM('general', 'infectious', 'chemical', 'radioactive', 'pharmaceutical'),
    defaultValue: 'general'
  },
  predictedCategory: DataTypes.STRING,
  confidence: DataTypes.FLOAT,
  imageUrl: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = Waste;
