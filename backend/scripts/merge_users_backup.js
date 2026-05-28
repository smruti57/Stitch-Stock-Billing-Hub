const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

(async () => {
  try {
    console.log('Merging users_backup into users (non-destructive)...');
    const backups = await new Promise((res, rej) => db.all('SELECT * FROM users_backup', (e, rows) => e ? rej(e) : res(rows)));
    for (const b of backups) {
      const exists = await new Promise((res, rej) => db.get('SELECT id FROM users WHERE LOWER(email)=LOWER(?)', [b.email], (e, r) => e ? rej(e) : res(r)));
      if (exists) {
        console.log('Skipping existing email', b.email);
        continue;
      }
      // Insert into users (don't set id to avoid PK conflict)
      await new Promise((res, rej) => db.run(
        `INSERT INTO users (name, email, password, role, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.name, b.email, b.password, b.role || 'merchant', b.isActive ? 1 : 0, b.createdAt, b.updatedAt],
        function (err) { if (err) rej(err); else res(this.lastID); }
      ));
      console.log('Inserted', b.email);
    }

    console.log('Dropping users_backup table...');
    await new Promise((res, rej) => db.run('DROP TABLE IF EXISTS users_backup', (e) => e ? rej(e) : res()));
    console.log('users_backup dropped.');

    // show new users counts
    const counts = await new Promise((res, rej) => db.get('SELECT COUNT(*) as c FROM users', (e, r) => e ? rej(e) : res(r)));
    console.log('users count now', counts.c);
  } catch (err) {
    console.error('Merge error', err);
  } finally {
    db.close();
  }
})();
