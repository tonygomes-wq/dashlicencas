import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'dashlicencas',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as string,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },

  // Bitdefender
  bitdefender: {
    defaultUrl: process.env.BITDEFENDER_DEFAULT_URL || 'https://cloud.gravityzone.bitdefender.com/api',
  },

  // Logs
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validar configurações críticas
export function validateConfig(): void {
  if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'change-this-secret-in-production') {
      throw new Error('JWT_SECRET deve ser configurado em produção!');
    }
    if (!process.env.DB_PASSWORD) {
      console.warn('⚠️  DB_PASSWORD não configurado!');
    }
  }
}
