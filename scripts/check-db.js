/**
 * Script para verificar el estado actual de la base de datos
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

async function checkDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Listar todas las tablas
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Tablas existentes en la base de datos:\n');
    if (result.rows.length === 0) {
      console.log('⚠️  NO HAY TABLAS - La base de datos está vacía');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }

    console.log(`\n📈 Total: ${result.rows.length} tablas\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
