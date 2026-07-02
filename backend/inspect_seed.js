const { sequelize } = require('./config/db');
const { Invoice } = require('./models/Invoice');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
(async () => {
  await sequelize.authenticate();
  const users = await User.findAll({ raw: true });
  console.log('users', users.length);
  users.forEach(u => console.log('user', u.id, u.email, u.name, u.createdAt));
  const products = await Product.findAll({ raw: true });
  console.log('products', products.length);
  const customers = await Customer.findAll({ raw: true });
  console.log('customers', customers.length);
  const invoices = await Invoice.findAll({ raw: true });
  console.log('invoices', invoices.length);
  invoices.forEach(inv => console.log('inv', inv.id, inv.ownerId, inv.invoiceNumber, inv.total, inv.status, inv.createdAt));
  process.exit(0);
})();
