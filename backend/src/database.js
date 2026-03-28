const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLite file-based database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../hos-system.db'),
  logging: false // Set to console.log to see SQL queries
});

// Disable foreign key constraints immediately for SQLite
async function disableForeignKeys() {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  } catch (err) {
    console.log('Note: Could not disable foreign keys');
  }
}

// Call immediately
disableForeignKeys();

module.exports = sequelize;
