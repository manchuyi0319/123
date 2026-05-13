import { Database } from './connection';
import fs from 'fs';
import path from 'path';

export function runMigrations(database: Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const applied = new Set(
    database.all('SELECT name FROM _migrations').map((r: any) => r.name)
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    database.transaction(() => {
      database.exec(sql);
      database.run('INSERT INTO _migrations (name) VALUES (?)', [file]);
      console.log(`  Migration applied: ${file}`);
    });
  }
}
