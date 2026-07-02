const { sequelize } = require('./config/db');
const { Invoice } = require('./models/Invoice');
const Customer = require('./models/Customer');
(async () => {
  await sequelize.authenticate();
  console.log('DB connected');
  console.log('Invoice count all:', await Invoice.count());
  console.log('Paid count:', await Invoice.count({ where: { status: 'PAID' } }));
  console.log('Sum total paid:', await Invoice.sum('total', { where: { status: 'PAID' } }));
  console.log('Sum total all:', await Invoice.sum('total', {}));
  console.log('Invoices raw:', await Invoice.findAll({ where: { status: 'PAID' }, raw: true }));
  process.exit(0);
})();
