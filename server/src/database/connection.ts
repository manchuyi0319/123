import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export class Database {
  private db: SqlJsDatabase;
  private dbPath: string;

  constructor(sqlDb: SqlJsDatabase, dbPath: string) {
    this.db = sqlDb;
    this.dbPath = dbPath;
    this.db.run('PRAGMA foreign_keys = ON');
  }

  run(sql: string, params: any[] = []): void {
    this.db.run(sql, params);
    this.save();
  }

  get(sql: string, params: any[] = []): any {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        return row;
      }
      return undefined;
    } finally {
      stmt.free();
    }
  }

  all(sql: string, params: any[] = []): any[] {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  exec(sql: string): void {
    this.db.run(sql);
    this.save();
  }

  transaction(fn: () => void): void {
    this.db.run('BEGIN');
    try {
      fn();
      this.db.run('COMMIT');
      this.save();
    } catch (e) {
      this.db.run('ROLLBACK');
      throw e;
    }
  }

  private save(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  close(): void {
    this.db.close();
  }
}

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  SQL = await initSqlJs();

  const dbDir = path.dirname(config.dbPath);
  let fileBuffer: Buffer | null = null;
  if (fs.existsSync(config.dbPath)) {
    fileBuffer = fs.readFileSync(config.dbPath);
  }

  const sqlDb = new SQL.Database(fileBuffer);
  db = new Database(sqlDb, config.dbPath);

  return db;
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}
