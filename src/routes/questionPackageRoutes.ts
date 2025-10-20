import { Router } from 'express';
import {
  createQuestionPackage,
  getQuestionPackages,
  getQuestionPackageById,
  updateQuestionPackage,
  deleteQuestionPackage,
} from '../controllers/questionPackageController';
import { validateQuestionPackage } from '../middleware/validation';

const router = Router();

router.post('/', validateQuestionPackage, createQuestionPackage);
router.get('/', getQuestionPackages);
router.get('/:id', getQuestionPackageById);
router.put('/:id', updateQuestionPackage);
router.delete('/:id', deleteQuestionPackage);

export default router;
