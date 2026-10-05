import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS } from '@smart-canteen/shared';

let io: SocketIOServer | null = null;

export const initializeSockets = (socketServer: SocketIOServer) => {
  io = socketServer;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join:canteen', (canteenId: string) => {
      socket.join(`canteen:${canteenId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined canteen:${canteenId}`);
    });

    socket.on('join:kitchen', (canteenId: string) => {
      socket.join(`kitchen:${canteenId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined kitchen:${canteenId}`);
    });

    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer | null => io;

export const emitToCanteen = (canteenId: string, event: string, data: any) => {
  if (io) {
    io.to(`canteen:${canteenId}`).emit(event, data);
    // Also emit globally for demo simplicity
    io.emit(event, data);
  }
};

export const emitToKitchen = (canteenId: string, event: string, data: any) => {
  if (io) {
    io.to(`kitchen:${canteenId}`).emit(event, data);
    io.emit(event, data);
  }
};

export const emitToOrder = (orderId: string, event: string, data: any) => {
  if (io) {
    io.to(`order:${orderId}`).emit(event, data);
    io.emit(event, data);
  }
};
