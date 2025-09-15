import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

// Routes de health check
router.get('/live', healthController.liveness.bind(healthController));
router.get('/ready', healthController.readiness.bind(healthController));
router.get('/detailed', healthController.detailed.bind(healthController));
router.get('/metrics', healthController.metrics.bind(healthController));

export default router;