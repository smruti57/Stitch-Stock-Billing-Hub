const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '%users%';", (err, rows) => {
  if (err) {
    console.error('Error querying sqlite_master:', err);
    process.exit(1);
  }
  console.log('sqlite_master entries matching %users%:');
  console.log(rows);
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (e, all) => {
    if (e) { console.error(e); process.exit(1); }
    console.log('\nAll tables:');
    console.log(all.map(r=>r.name));
    db.close();
  });
});
