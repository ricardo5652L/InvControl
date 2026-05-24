const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_secret' : undefined);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const CORS_ORIGIN = process.env.CORS_ORIGIN || (NODE_ENV === 'development' ? 'http://localhost:5173' : undefined);
const DATA_SOURCE = process.env.DATA_SOURCE || 'memory';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'invcontrol';

if (NODE_ENV === 'production') {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production. Set the environment variable.');
  }
  if (!CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN is required in production. Set the environment variable.');
  }
}

export const config = {
  NODE_ENV,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CORS_ORIGIN,
  DATA_SOURCE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
};