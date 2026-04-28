import { Router } from 'express';
import * as bitdefenderController from '../controllers/bitdefender.controller';
import * as bitdefenderStatsController from '../controllers/bitdefender-stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/v1/bitdefender/stats
 * @desc Obter estatísticas gerais
 * @access Private
 */
router.get('/stats', bitdefenderStatsController.getStats);

/**
 * @route GET /api/v1/bitdefender/alerts
 * @desc Obter alertas de vencimento e uso
 * @access Private
 */
router.get('/alerts', bitdefenderStatsController.getAlerts);

/**
 * @route GET /api/v1/bitdefender/usage-summary
 * @desc Obter resumo de uso de licenças
 * @access Private
 */
router.get('/usage-summary', bitdefenderStatsController.getUsageSummary);

/**
 * @route GET /api/v1/bitdefender
 * @desc Listar todas as licenças Bitdefender
 * @access Private
 */
router.get('/', bitdefenderController.list);

/**
 * @route GET /api/v1/bitdefender/:id
 * @desc Obter licença específica por ID
 * @access Private
 */
router.get('/:id', bitdefenderController.getById);

/**
 * @route POST /api/v1/bitdefender
 * @desc Criar nova licença Bitdefender
 * @access Private (Admin only)
 */
router.post('/', bitdefenderController.create);

/**
 * @route PUT /api/v1/bitdefender/:id
 * @desc Atualizar licença existente
 * @access Private (Admin only)
 */
router.put('/:id', bitdefenderController.update);

/**
 * @route DELETE /api/v1/bitdefender/:id
 * @desc Deletar licença
 * @access Private (Admin only)
 */
router.delete('/:id', bitdefenderController.remove);

/**
 * @route POST /api/v1/bitdefender/bulk-delete
 * @desc Deletar múltiplas licenças
 * @access Private (Admin only)
 */
router.post('/bulk-delete', bitdefenderController.bulkDelete);

export default router;
