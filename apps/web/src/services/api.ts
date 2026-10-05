import axios from 'axios';
import { io, Socket } from 'socket.io-client';

export const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_canteen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const currentRole = localStorage.getItem('smart_canteen_role');
  if (currentRole) {
    config.headers['x-demo-role'] = currentRole;
  }
  return config;
});

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
  }
  return socketInstance;
};
