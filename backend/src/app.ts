import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';

// Rotas
import authRoutes from './routes/auth.routes';
import bitdefenderRoutes from './routes/bitdefender.routes';

const app: Application = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors(config.cors));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compressão de respostas
app.use(compression());

// Logging (apenas em desenvolvimento)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Rotas da API
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/bitdefender`, bitdefenderRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// Error handler global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro não tratado:', err);

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: config.nodeEnv === 'development' ? err.message : undefined,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
});

export default app;
