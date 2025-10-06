#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const [, , mode, ...capArgs] = process.argv;

if (!mode || !['prod', 'dev'].includes(mode)) {
  console.error('Usage: node scripts/run-capacitor.js <prod|dev> <cap-command> [...args]');
  process.exit(1);
}

if (capArgs.length === 0) {
  console.error('No Capacitor command provided. Example: node scripts/run-capacitor.js prod sync android');
  process.exit(1);
}

const projectRoot = path.join(__dirname, '..');
const configPath = path.join(projectRoot, 'capacitor.config.ts');
const devConfigPath = path.join(projectRoot, 'capacitor.config.dev.ts');

let originalConfig = null;

if (!fs.existsSync(configPath)) {
  console.error('capacitor.config.ts not found.');
  process.exit(1);
}

if (mode === 'dev') {
  if (!fs.existsSync(devConfigPath)) {
    console.error('capacitor.config.dev.ts not found.');
    process.exit(1);
  }
  originalConfig = fs.readFileSync(configPath, 'utf8');
  fs.copyFileSync(devConfigPath, configPath);
}

let result;
try {
  result = spawnSync('npx', ['cap', ...capArgs], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
} finally {
  if (mode === 'dev' && originalConfig !== null) {
    fs.writeFileSync(configPath, originalConfig);
  }
}

if (result.error) {
  console.error('Capacitor command failed:', result.error.message);
}

process.exit(result.status ?? 1);
