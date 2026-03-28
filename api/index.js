const express = require('express');
const mongoose = require('mongoose');
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

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hos-system';

// Connection pool reuse for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = db;
  return db;
}

// Initialize DB connection (non-blocking)
connectToDatabase()
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err.message));

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
