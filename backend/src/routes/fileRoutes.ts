import { Router } from 'express';
import multer from 'multer';
import { uploadFile, downloadFile, getProjectFiles } from '../controllers/fileController';
import { requireAuth } from '../middlewares/auth';
import { env } from '../config/env';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.STORAGE_MAX_FILE_SIZE_BYTES,
  },
});

router.post('/upload', requireAuth, upload.single('file'), uploadFile);
router.get('/:fileKey/download', requireAuth, downloadFile);
router.get('/project/:projectId', requireAuth, getProjectFiles);

export default router;
