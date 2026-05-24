const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_secret' : undefined);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const CORS_ORIGIN = process.env.CORS_ORIGIN || (NODE_ENV === 'development' ? 'http://localhost:5173' : undefined);

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
  CORS_ORIGIN
};