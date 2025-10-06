/**
 * Script para ejecutar migración directamente en PostgreSQL
 * Academia de Hábitos Saludables V2.0
 */

import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en .env');
  process.exit(1);
}

async function executeSQLFile(client, filePath, description) {
  console.log(`\n📄 Ejecutando: ${description}`);
  console.log(`   Archivo: ${path.basename(filePath)}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Ejecutar todo el archivo como una transacción
    await client.query('BEGIN');

    try {
      await client.query(sql);
      await client.query('COMMIT');

      console.log(`   ✅ Completado exitosamente`);
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    if (error.position) {
      console.error(`   Posición del error: ${error.position}`);
    }
    return { success: false, error };
  }
}

async function runMigration() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MIGRACIÓN V2.0 - Academia de Hábitos Saludables     ║');
  console.log('║   Sistema de Puntos de Vitalidad y Gamificación       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Conectar a la base de datos
    console.log('\n🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conexión exitosa');

    // Paso 1: Migración principal
    const migration = await executeSQLFile(
      client,
      path.join(__dirname, 'migration-v2.sql'),
      'Migración de Base de Datos V2.0'
    );

    if (!migration.success) {
      throw new Error('Error en la migración principal');
    }

    // Paso 2: Seed de actividades
    const activities = await executeSQLFile(
      client,
      path.join(__dirname, 'seed-activities.sql'),
      'Seed: Catálogo de 50+ Actividades METs'
    );

    if (!activities.success) {
      console.warn('⚠️  Advertencia: Error en seed de actividades');
    }

    // Paso 3: Seed de logros
    const achievements = await executeSQLFile(
      client,
      path.join(__dirname, 'seed-achievements.sql'),
      'Seed: Sistema de Logros y Recompensas'
    );

    if (!achievements.success) {
      console.warn('⚠️  Advertencia: Error en seed de logros');
    }

    // Paso 4: Seed de bloques de entrenamiento
    const trainingBlocks = await executeSQLFile(
      client,
      path.join(__dirname, 'seed-training-blocks.sql'),
      'Seed: Bloques de Entrenamiento de 10 Minutos'
    );

    if (!trainingBlocks.success) {
      console.warn('⚠️  Advertencia: Error en seed de bloques');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              MIGRACIÓN COMPLETADA                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Tiempo total: ${duration} segundos`);
    console.log('\n✅ La base de datos está lista para el nuevo sistema!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Iniciar el servidor: npm run start:dev');
    console.log('   2. Acceder a http://localhost:3000/activities');
    console.log('   3. Probar el registro de actividades');
    console.log('   4. Acceder a http://localhost:3000/training-blocks\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que DATABASE_URL sea correcta');
    console.error('   - Asegúrate de tener permisos de administrador');
    console.error('   - Revisa los logs anteriores para más detalles\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar migración
runMigration();
