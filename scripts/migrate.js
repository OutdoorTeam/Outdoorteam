import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const migrationSql = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'migration.sql'),
  'utf8'
);

async function runMigrations() {
  if (process.env.FEATURE_MIGRATIONS === 'false' && process.argv[2] !== '--force') {
    console.log('FEATURE_MIGRATIONS is false. Skipping migrations. Use `npm run db:migrate -- --force` to run manually.');
    return;
  }

  console.log('Connecting to database to run migrations...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Evita el error SELF_SIGNED_CERT_IN_CHAIN con el pooler de Supabase
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log('Starting database migration...');
    await client.query(migrationSql);
    console.log('✅ Database migration completed successfully.');
  } catch (err) {
    console.error('❌ Error during database migration:', err);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

runMigrations();