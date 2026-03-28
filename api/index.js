const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// SQLite Database Connection via Sequelize
const sequelize = require('../backend/src/database');

// Initialize models
const User = require('../backend/src/models/User');
const Waste = require('../backend/src/models/Waste');
const Compliance = require('../backend/src/models/Compliance');
const Analytics = require('../backend/src/models/Analytics');

// Define associations after models are loaded
// Simple associations without enforced FK constraints
Waste.belongsTo(User, { foreignKey: 'hospitalId', constraints: false });
Compliance.belongsTo(User, { foreignKey: 'hospitalId', constraints: false });
Analytics.belongsTo(User, { foreignKey: 'hospitalId', constraints: false });

// Sync database (creates tables if they don't exist)
async function initializeDatabase() {
  try {
    if (sequelize.getDialect() === 'sqlite') {
      // Keep local SQLite behavior as before
      await sequelize.query('PRAGMA foreign_keys = OFF');
      await sequelize.sync({ alter: true });
      console.log('✓ SQLite database synchronized');
      return;
    }

    // Hosted DB: avoid schema alter on every cold start
    await sequelize.sync();
    console.log('✓ Database synchronized');
  } catch (err) {
    console.error('✗ Database sync error:', err.message);
  }
}

// Initialize DB connection (non-blocking)
initializeDatabase()
  .catch(err => console.error('Database initialization error:', err.message));

// Don't wait for DB before starting server

// Routes
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/waste', require('../backend/src/routes/waste'));
app.use('/api/compliance', require('../backend/src/routes/compliance'));
app.use('/api/analytics', require('../backend/src/routes/analytics'));
app.use('/api/admin', require('../backend/src/routes/admin'));

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// Serve dashboard
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/html/404.html'), (err) => {
    if (err) res.status(404).json({ message: 'Not Found' });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
