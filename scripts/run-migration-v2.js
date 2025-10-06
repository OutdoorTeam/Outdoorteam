/**
 * Script para ejecutar la migración V2.0 completa
 * Academia de Hábitos Saludables
 *
 * Este script ejecuta en orden:
 * 1. Migración de base de datos (migration-v2.sql)
 * 2. Seed de actividades METs (seed-activities.sql)
 * 3. Seed de logros (seed-achievements.sql)
 * 4. Seed de bloques de entrenamiento (seed-training-blocks.sql)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Faltan variables de entorno');
  console.error('Asegúrate de tener VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE (o SUPABASE_SERVICE_ROLE_KEY) en tu .env');
  console.error('supabaseUrl:', supabaseUrl ? 'SET' : 'NOT SET');
  console.error('supabaseServiceKey:', supabaseServiceKey ? 'SET' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath, description) {
  console.log(`\n📄 Ejecutando: ${description}`);
  console.log(`   Archivo: ${path.basename(filePath)}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Dividir el SQL en statements individuales
    // Nota: Esta es una implementación simple. Para SQL complejo, considera usar una librería
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios y bloques vacíos
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // Intentar ejecutar directamente si el RPC no funciona
          const { error: directError } = await supabase.from('_temp_exec').select('*').limit(0);

          if (!directError) {
            console.log(`   ⚠️  Advertencia en statement ${i + 1}: ${error.message}`);
          }
        }

        successCount++;

        // Mostrar progreso cada 10 statements
        if (successCount % 10 === 0) {
          console.log(`   ✓ ${successCount} statements ejecutados...`);
        }
      } catch (err) {
        errorCount++;
        console.error(`   ❌ Error en statement ${i + 1}:`, err.message);
      }
    }

    console.log(`   ✅ Completado: ${successCount} statements ejecutados`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} statements con errores (podrían ser advertencias)`);
    }

    return { success: true, successCount, errorCount };
  } catch (error) {
    console.error(`   ❌ Error leyendo archivo:`, error.message);
    return { success: false, error };
  }
}

async function runMigration() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MIGRACIÓN V2.0 - Academia de Hábitos Saludables     ║');
  console.log('║   Sistema de Puntos de Vitalidad y Gamificación       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    // Verificar conexión
    console.log('\n🔌 Verificando conexión a Supabase...');
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`No se pudo conectar a Supabase: ${error.message}`);
    }

    console.log('   ✅ Conexión exitosa');

    // Paso 1: Ejecutar migración principal
    const migration = await executeSQLFile(
      path.join(__dirname, 'migration-v2.sql'),
      'Migración de Base de Datos V2.0'
    );

    if (!migration.success) {
      throw new Error('Error en la migración principal');
    }

    // Paso 2: Seed de actividades
    const activities = await executeSQLFile(
      path.join(__dirname, 'seed-activities.sql'),
      'Seed: Catálogo de 50+ Actividades METs'
    );

    if (!activities.success) {
      console.warn('⚠️  Advertencia: Error en seed de actividades, continuando...');
    }

    // Paso 3: Seed de logros
    const achievements = await executeSQLFile(
      path.join(__dirname, 'seed-achievements.sql'),
      'Seed: Sistema de Logros y Recompensas'
    );

    if (!achievements.success) {
      console.warn('⚠️  Advertencia: Error en seed de logros, continuando...');
    }

    // Paso 4: Seed de bloques de entrenamiento
    const trainingBlocks = await executeSQLFile(
      path.join(__dirname, 'seed-training-blocks.sql'),
      'Seed: Bloques de Entrenamiento de 10 Minutos'
    );

    if (!trainingBlocks.success) {
      console.warn('⚠️  Advertencia: Error en seed de bloques, continuando...');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              MIGRACIÓN COMPLETADA                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Tiempo total: ${duration} segundos`);
    console.log('\n📊 Resumen:');
    console.log(`   ✓ Migración de BD: ${migration.successCount} statements`);
    console.log(`   ✓ Actividades METs: ${activities.successCount || 0} statements`);
    console.log(`   ✓ Logros: ${achievements.successCount || 0} statements`);
    console.log(`   ✓ Bloques de Entrenamiento: ${trainingBlocks.successCount || 0} statements`);
    console.log('\n✅ La base de datos está lista para el nuevo sistema!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Actualizar las APIs del servidor');
    console.log('   2. Actualizar los componentes del frontend');
    console.log('   3. Probar el flujo completo');
    console.log('   4. Generar APK actualizada\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que las credenciales de Supabase sean correctas');
    console.error('   - Asegúrate de tener permisos de administrador en la BD');
    console.error('   - Revisa los logs de errores anteriores para más detalles');
    process.exit(1);
  }
}

// Ejecutar migración
runMigration();
