require('dotenv').config();
const { sequelize } = require('./config/db');
require('./models/User');
require('./models/Product');
require('./models/Customer');
require('./models/Invoice');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('connected');
    await sequelize.sync({ alter: true, logging: console.log });
    console.log('sync complete');
    process.exit(0);
  } catch (err) {
    console.error('sync error', err.name, err.message);
    if (err.sql) console.error('SQL:', err.sql);
    if (err.parent) console.error('parent:', err.parent);
    if (err.errors) err.errors.forEach(e => console.error(e.type, e.message, e.path, e.value));
    process.exit(1);
  }
})();
