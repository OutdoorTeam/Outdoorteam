/**
 * Verificar qué tablas faltan para la migración
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

async function checkMissingTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // Tablas que la migración V2 necesita verificar/modificar
    const requiredTables = [
      'users',
      'user_avatars',
      'meditation_sessions',
      'step_counts',
      'daily_habits',
      'profiles'
    ];

    console.log('🔍 Verificando tablas necesarias para la migración:\n');

    for (const tableName of requiredTables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [tableName]);

      const exists = result.rows[0].exists;
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${tableName}: ${exists ? 'EXISTE' : 'NO EXISTE'}`);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMissingTables();
