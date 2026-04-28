import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { BitdefenderLicense, BitdefenderLicenseResponse } from '../types';
import { transformToCamelCase, transformToSnakeCase } from '../utils/transformers';

/**
 * Listar todas as licenças Bitdefender
 */
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const licenses = await query<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses ORDER BY company ASC'
    );

    // Transformar para camelCase
    const response = licenses.map(license => 
      transformToCamelCase<BitdefenderLicenseResponse>(license)
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erro ao listar licenças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar licenças',
    });
  }
}

/**
 * Obter uma licença específica por ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const license = await queryOne<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses WHERE id = ?',
      [id]
    );

    if (!license) {
      res.status(404).json({
        success: false,
        error: 'Licença não encontrada',
      });
      return;
    }

    const response = transformToCamelCase<BitdefenderLicenseResponse>(license);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erro ao buscar licença:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar licença',
    });
  }
}

/**
 * Criar nova licença Bitdefender
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    // Apenas admin pode criar
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Apenas administradores podem criar licenças',
      });
      return;
    }

    const data = req.body;

    // Validar campos obrigatórios
    if (!data.company) {
      res.status(400).json({
        success: false,
        error: 'Campo "company" é obrigatório',
      });
      return;
    }

    // Converter para snake_case
    const dbData = transformToSnakeCase(data);

    // Inserir no banco
    const result = await query(
      `INSERT INTO bitdefender_licenses (
        user_id, company, contact_person, email, expiration_date,
        total_licenses, license_key, renewal_status, client_api_key,
        client_access_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        dbData.company,
        dbData.contact_person || null,
        dbData.email || null,
        dbData.expiration_date || null,
        dbData.total_licenses || 0,
        dbData.license_key || null,
        dbData.renewal_status || 'Pendente',
        dbData.client_api_key || null,
        dbData.client_access_url || null,
        dbData.notes || null,
      ]
    );

    // Buscar registro criado
    const insertId = (result as any).insertId;
    const newLicense = await queryOne<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses WHERE id = ?',
      [insertId]
    );

    const response = transformToCamelCase<BitdefenderLicenseResponse>(newLicense);

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Erro ao criar licença:', error);

    // Tratar erro de chave duplicada
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        error: 'Duplicate Entry',
        message: 'Esta chave de licença já existe no sistema',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar licença',
    });
  }
}

/**
 * Atualizar licença existente
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    // Apenas admin pode atualizar
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Apenas administradores podem atualizar licenças',
      });
      return;
    }

    const { id } = req.params;
    const data = req.body;

    // Verificar se licença existe
    const existing = await queryOne<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses WHERE id = ?',
      [id]
    );

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Licença não encontrada',
      });
      return;
    }

    // Converter para snake_case
    const dbData = transformToSnakeCase(data);

    // Remover campos que não devem ser atualizados
    delete dbData.id;
    delete dbData.user_id;
    delete dbData.created_at;

    // Construir query dinâmica
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(dbData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
      });
      return;
    }

    values.push(id);

    // Executar update
    await query(
      `UPDATE bitdefender_licenses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Buscar registro atualizado
    const updated = await queryOne<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses WHERE id = ?',
      [id]
    );

    const response = transformToCamelCase<BitdefenderLicenseResponse>(updated);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar licença',
    });
  }
}

/**
 * Deletar licença
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    // Apenas admin pode deletar
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Apenas administradores podem deletar licenças',
      });
      return;
    }

    const { id } = req.params;

    // Verificar se existe
    const existing = await queryOne<BitdefenderLicense>(
      'SELECT * FROM bitdefender_licenses WHERE id = ?',
      [id]
    );

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Licença não encontrada',
      });
      return;
    }

    // Deletar
    await query('DELETE FROM bitdefender_licenses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Licença deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar licença:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar licença',
    });
  }
}

/**
 * Deletar múltiplas licenças
 */
export async function bulkDelete(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    // Apenas admin pode deletar
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Apenas administradores podem deletar licenças',
      });
      return;
    }

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Array de IDs é obrigatório',
      });
      return;
    }

    const placeholders = ids.map(() => '?').join(',');
    const result = await query(
      `DELETE FROM bitdefender_licenses WHERE id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      message: `${(result as any).affectedRows} licenças deletadas`,
      count: (result as any).affectedRows,
    });
  } catch (error) {
    console.error('Erro ao deletar licenças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar licenças',
    });
  }
}
