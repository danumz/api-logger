import { Router } from 'express';
import { uploadDocument, getSupportedFormats } from '../controllers/documentController';
import upload from '../middleware/upload';

const router = Router();

// Upload Word document and create question package
router.post('/upload', upload.single('document'), uploadDocument);

// Get information about supported document formats
router.get('/formats', getSupportedFormats);

export default router;
