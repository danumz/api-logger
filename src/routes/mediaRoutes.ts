import { Router } from 'express';
import {
  uploadMedia,
  getMedia,
  getMediaById,
  downloadMedia,
  deleteMedia,
} from '../controllers/mediaController';
import upload from '../middleware/upload';
import { validateMediaUpload } from '../middleware/validation';

const router = Router();

router.post('/', upload.single('file'), validateMediaUpload, uploadMedia);
router.get('/', getMedia);
router.get('/:id', getMediaById);
router.get('/:id/download', downloadMedia);
router.delete('/:id', deleteMedia);

export default router;
