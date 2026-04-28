import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/database';
import { config } from '../config/env';
import { User, LoginRequest, AuthResponse, UserResponse } from '../types';
import { removeSensitiveFields } from '../utils/transformers';

/**
 * Login de usuário
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validar campos obrigatórios
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios',
      });
      return;
    }

    // Buscar usuário por email
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
      });
      return;
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
      });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    // Preparar resposta (sem dados sensíveis)
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    };

    const response: AuthResponse = {
      user: userResponse,
      token,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

/**
 * Obter dados do usuário autenticado
 */
export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    // Buscar dados atualizados do usuário
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [req.user.userId]
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    };

    res.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

/**
 * Logout (invalidar token - implementação futura com blacklist)
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // Por enquanto, apenas retorna sucesso
  // Em produção, adicionar token a uma blacklist no Redis
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
}
