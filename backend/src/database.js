const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Production/hosted DB (recommended for Vercel): Postgres via DATABASE_URL
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {}
  });
} else {
  // Local development fallback
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../hos-system.db'),
    logging: false
  });
}

// Disable foreign key constraints immediately for SQLite
async function disableForeignKeys() {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }

  try {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  } catch (err) {
    console.log('Note: Could not disable foreign keys');
  }
}

// Call immediately
disableForeignKeys();

module.exports = sequelize;
