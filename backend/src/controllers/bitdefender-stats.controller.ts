import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';

/**
 * Obter estatísticas gerais do Bitdefender
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    // Total de licenças
    const totalResult = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM bitdefender_licenses'
    );

    // Licenças vencidas
    const expiredResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM bitdefender_licenses 
       WHERE expiration_date < CURDATE() AND expiration_date IS NOT NULL`
    );

    // Licenças vencendo em 30 dias
    const expiringResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM bitdefender_licenses 
       WHERE expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
    );

    // Licenças ativas (não vencidas)
    const activeResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM bitdefender_licenses 
       WHERE (expiration_date >= CURDATE() OR expiration_date IS NULL)`
    );

    // Total de slots usados e disponíveis
    const slotsResult = await queryOne<{ total_used: number; total_available: number }>(
      `SELECT 
        COALESCE(SUM(used_slots), 0) as total_used,
        COALESCE(SUM(total_slots), 0) as total_available
       FROM bitdefender_licenses`
    );

    // Licenças com alerta de uso
    const alertsResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM bitdefender_licenses 
       WHERE license_usage_alert = 1`
    );

    // Calcular percentual de uso geral
    const usagePercent = slotsResult && slotsResult.total_available > 0
      ? (slotsResult.total_used / slotsResult.total_available) * 100
      : 0;

    res.json({
      success: true,
      data: {
        total: totalResult?.count || 0,
        expired: expiredResult?.count || 0,
        expiring: expiringResult?.count || 0,
        active: activeResult?.count || 0,
        usedSlots: slotsResult?.total_used || 0,
        totalSlots: slotsResult?.total_available || 0,
        usagePercent: Math.round(usagePercent * 100) / 100,
        alerts: alertsResult?.count || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
    });
  }
}

/**
 * Obter licenças com alertas de vencimento ou uso
 */
export async function getAlerts(req: Request, res: Response): Promise<void> {
  try {
    // Licenças vencidas
    const expired = await query(
      `SELECT id, company, expiration_date, 'expired' as alert_type
       FROM bitdefender_licenses 
       WHERE expiration_date < CURDATE() AND expiration_date IS NOT NULL
       ORDER BY expiration_date DESC`
    );

    // Licenças vencendo em 30 dias
    const expiring = await query(
      `SELECT id, company, expiration_date, 'expiring' as alert_type
       FROM bitdefender_licenses 
       WHERE expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY expiration_date ASC`
    );

    // Licenças com uso alto (>= 90%)
    const highUsage = await query(
      `SELECT id, company, used_slots, total_slots, license_usage_percent, 'high_usage' as alert_type
       FROM bitdefender_licenses 
       WHERE license_usage_percent >= 90 AND total_slots > 0
       ORDER BY license_usage_percent DESC`
    );

    res.json({
      success: true,
      data: {
        expired,
        expiring,
        highUsage,
        total: expired.length + expiring.length + highUsage.length,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar alertas',
    });
  }
}

/**
 * Obter resumo de uso de licenças
 */
export async function getUsageSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await query(
      `SELECT 
        id,
        company,
        used_slots,
        total_slots,
        license_usage_percent,
        license_usage_alert,
        license_usage_last_sync,
        CASE 
          WHEN license_usage_percent >= 100 THEN 'critical'
          WHEN license_usage_percent >= 90 THEN 'warning'
          WHEN license_usage_percent >= 70 THEN 'info'
          ELSE 'ok'
        END as status
       FROM bitdefender_licenses 
       WHERE total_slots > 0
       ORDER BY license_usage_percent DESC`
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de uso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar resumo de uso',
    });
  }
}
