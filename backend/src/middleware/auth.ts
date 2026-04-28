import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload } from '../types';

// Estender Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware de autenticação JWT
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Token não fornecido' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar e decodificar token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Adicionar dados do usuário ao request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'Token expirado' 
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'Token inválido' 
      });
      return;
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Erro ao validar token' 
    });
  }
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Usuário não autenticado' 
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      error: 'Forbidden',
      message: 'Acesso restrito a administradores' 
    });
    return;
  }

  next();
}

/**
 * Middleware opcional de autenticação (não retorna erro se não autenticado)
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      req.user = decoded;
    }
  } catch (error) {
    // Ignora erros de token em autenticação opcional
  }
  
  next();
}
