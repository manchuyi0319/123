import app from './app';
import { config } from './config';
import { initDatabase } from './database/connection';
import { runMigrations } from './database/migrate';
import { runSeed } from './database/seed';

async function main() {
  console.log('Class Pet Garden Server');
  console.log('=======================');

  const db = await initDatabase();
  runMigrations(db);
  runSeed(db);

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
  });
}

main().catch(console.error);
