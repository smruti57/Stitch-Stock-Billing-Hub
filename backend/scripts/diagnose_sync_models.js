(async () => {
  const path = require('path');
  const { sequelize } = require('../config/db');
  try {
    // Require all model files to mirror server startup
    require('../models/User');
    require('../models/Product');
    require('../models/Customer');
    require('../models/Invoice');

    console.log('Models loaded. Authenticating DB...');
    await sequelize.authenticate();
    console.log('Authenticated. Attempting alter sync (with models)...');
    await sequelize.sync({ alter: true });
    console.log('Sync completed without error when models loaded.');
  } catch (err) {
    console.error('--- SYNC ERROR (models loaded) ---');
    console.error('name:', err.name);
    console.error('message:', err.message);
    if (err.parent) {
      console.error('parent.code:', err.parent.code);
      console.error('parent.message:', err.parent.message);
    }
    console.error('stack:', err.stack);

    // Dump table schemas for key tables
    try {
      const sqlite3 = require('sqlite3');
      const fs = require('fs');
      const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
      if (fs.existsSync(dbPath)) {
        const db = new sqlite3.Database(dbPath);
        const tables = ['users','products','customers'];
        for (const t of tables) {
          await new Promise((res) => {
            db.all(`PRAGMA table_info(${t});`, (_e, rows) => {
              console.log(`--- ${t} schema ---`);
              if (_e) console.error('PRAGMA error:', _e.message);
              else console.table(rows);
              res();
            });
          });
        }
        db.close();
      } else {
        console.log('database.sqlite not found at', dbPath);
      }
    } catch (e) {
      console.error('Failed to inspect sqlite schema:', e);
    }

    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {};
  }
})();
