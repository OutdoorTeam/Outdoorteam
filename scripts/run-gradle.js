#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const tasks = process.argv.slice(2);
if (tasks.length === 0) {
  console.error('No Gradle task provided. Example: node scripts/run-gradle.js assembleDebug');
  process.exit(1);
}

const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('Android project directory not found. Run "npx cap add android" first.');
  process.exit(1);
}

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

const result = spawnSync(gradleCommand, tasks, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('Gradle execution failed:', result.error.message);
}

process.exit(result.status ?? 1);
