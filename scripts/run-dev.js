const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('  🚀 STARTING SMART CANTEEN ENTERPRISE AI PLATFORM (DEV SUITE)  ');
console.log('================================================================\n');

const rootDir = path.resolve(__dirname, '..');

// 1. Python AI Service (Port 8000)
console.log('[Dev Runner] Starting AI Microservice (FastAPI + ML Models)...');
const aiProcess = spawn('python', ['apps/ai-service/main.py'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit'
});

// 2. Node.js Express API (Port 5000)
console.log('[Dev Runner] Starting Backend API (Express + Socket.IO)...');
const apiProcess = spawn('npx.cmd', ['ts-node', 'apps/api/src/server.ts'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit'
});

// 3. React Vite Frontend (Port 3000)
console.log('[Dev Runner] Starting Web Frontend (React + Vite)...');
const webProcess = spawn('npx.cmd', ['vite', '--host'], {
  cwd: path.resolve(rootDir, 'apps/web'),
  shell: true,
  stdio: 'inherit'
});

const cleanup = () => {
  console.log('\n[Dev Runner] Shutting down all services...');
  try { aiProcess.kill(); } catch (e) {}
  try { apiProcess.kill(); } catch (e) {}
  try { webProcess.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
