import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://user:123@cluster0.da9wxwy.mongodb.net/smart_canteen?retryWrites=true&w=majority',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  jwtSecret: process.env.JWT_SECRET || 'smart-canteen-enterprise-super-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
