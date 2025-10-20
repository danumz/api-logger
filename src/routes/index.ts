import { Router } from 'express';
import questionPackageRoutes from './questionPackageRoutes';
import questionRoutes from './questionRoutes';
import mediaRoutes from './mediaRoutes';
import documentRoutes from './documentRoutes';

const router = Router();

router.use('/question-packages', questionPackageRoutes);
router.use('/questions', questionRoutes);
router.use('/media', mediaRoutes);
router.use('/documents', documentRoutes);

export default router;
