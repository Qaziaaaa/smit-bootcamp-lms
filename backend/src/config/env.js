// Central place for all environment variables.
// Reads from .env file via dotenv, provides defaults for local development.
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

// In production, JWT_SECRET is mandatory (no fallback)
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production. Refusing to start with an insecure default secret.');
}

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;
