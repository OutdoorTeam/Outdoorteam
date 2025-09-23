import { startServer } from '../server/index.js';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

async function setupEnv() {
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example.');
      console.log('⚠️ IMPORTANT: Please fill in your credentials in the .env file for the server to work correctly.');
    } else {
      console.warn('⚠️ .env.example not found. Could not create .env file.');
    }
  }
  // Load env vars from .env file for the dev script
  dotenv.config();
}

async function startDev() {
  // Ensure .env file exists and load it
  await setupEnv();

  // Start the Express API server first
  await startServer(3001);

  // Then start Vite in dev mode
  const viteServer = await createServer({
    configFile: './vite.config.js',
  });

  await viteServer.listen();
  console.log(
    `Vite dev server running on port ${viteServer.config.server.port}`,
  );
}

startDev().catch(err => {
  console.error("Failed to start dev server:", err);
  process.exit(1);
});
