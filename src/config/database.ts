import { Pool } from 'pg';
import dotenv from 'dotenv';
import { Logger } from '../utils/logger.util';

dotenv.config();

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
});

db.on('connect', (client) => {
  Logger.debug('Database client connected');
});

db.on('error', (err, client) => {
  Logger.error('Database error:', err);
});

db.on('remove', (client) => {
  Logger.debug('Database client removed');
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await db.connect();
    client.release();
    return true;
  } catch (error) {
    Logger.error('Database connection test failed:', error);
    return false;
  }
};