import { Router } from 'express';
import multer from 'multer';

import ImageController from '#controllers/images.controller.js';

const router = Router();
const imageController = new ImageController();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('student_image'), imageController.getFaceEncoding);

export default router;
