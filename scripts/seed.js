import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  if (process.env.FEATURE_SEED_DB === 'false') {
    console.log('FEATURE_SEED_DB is false. Skipping database seeding.');
    return;
  }

  console.log('Connecting to database for seeding...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    console.log('Starting database seeding...');
    // Add your seed logic here. For example:
    // await client.query(`
    //   INSERT INTO plans (name, description, price, services_included, features_json)
    //   VALUES ('Basic', 'Basic Plan', 10, '[]', '{}')
    //   ON CONFLICT (name) DO NOTHING;
    // `);
    console.log('✅ Database seeding completed successfully (stub).');
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

seedDatabase();
