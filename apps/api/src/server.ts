import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { config } from './config';
import { initializeSockets } from './sockets';
import { db } from './storage';
import { seedDatabase } from './seeds/seed';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

initializeSockets(io);

// Auto-seed if database is empty on boot
if (db.getState().users.length === 0) {
  console.log('[Server] Database is empty on boot. Executing initial seed...');
  seedDatabase();
}

server.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` 🚀 Smart Canteen API Server running on port ${config.port}`);
  console.log(` 📡 Real-time Socket.IO initialized`);
  console.log(` 🤖 AI Service configured at: ${config.aiServiceUrl}`);
  console.log(` 🌐 Health endpoint: http://localhost:${config.port}/health`);
  console.log(`=======================================================`);
});
