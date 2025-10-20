import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByContentType,
} from '../controllers/questionController';
import { validateQuestion } from '../middleware/validation';

const router = Router();

router.post('/package/:packageId', validateQuestion, createQuestion);
router.get('/package/:packageId', getQuestions);
router.get('/content-type/:contentType', getQuestionsByContentType);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
