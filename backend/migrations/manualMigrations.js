const path = require("path");

const loadModels = () => {
  const InvoiceModels = require("../models/Invoice");
  const models = [
    require("../models/User"),
    require("../models/Product"),
    require("../models/Customer"),
    InvoiceModels.Invoice,
    InvoiceModels.InvoiceItem,
  ];
  return models;
};

const normalizeTableName = (tableName) => {
  if (typeof tableName === "object" && tableName !== null) {
    return tableName.tableName || tableName.table || tableName.name;
  }
  return tableName;
};

const dropStaleBackupTables = async (queryInterface) => {
  const tables = await queryInterface.showAllTables();
  const tableNames = tables.map(normalizeTableName).filter(Boolean);
  for (const tableName of tableNames) {
    if (/_backup$/i.test(tableName)) {
      await queryInterface.dropTable(tableName);
      console.log(`Dropped stale backup table: ${tableName}`);
    }
  }
};

const ensureColumns = async (queryInterface, model, tableName, existingColumns) => {
  const columnsToAdd = [];
  for (const [columnName, attribute] of Object.entries(model.rawAttributes)) {
    if (!Object.prototype.hasOwnProperty.call(existingColumns, columnName)) {
      columnsToAdd.push({ columnName, attribute });
    }
  }

  for (const { columnName, attribute } of columnsToAdd) {
    console.log(`Adding missing column ${tableName}.${columnName}`);
    await queryInterface.addColumn(tableName, columnName, attribute);
  }
};

const ensureSchema = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();
  const models = loadModels();

  await dropStaleBackupTables(queryInterface);

  const existingTablesRaw = await queryInterface.showAllTables();
  const existingTables = existingTablesRaw.map(normalizeTableName).filter(Boolean);

  for (const model of models) {
    const tableName = normalizeTableName(model.getTableName());
    if (!existingTables.includes(tableName)) {
      console.log(`Creating missing table: ${tableName}`);
      await model.sync();
      continue;
    }

    const existingColumns = await queryInterface.describeTable(tableName);
    await ensureColumns(queryInterface, model, tableName, existingColumns);
  }
};

module.exports = { ensureSchema };
