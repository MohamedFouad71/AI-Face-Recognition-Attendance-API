import { Router } from 'express';
import multer from 'multer';

import AttendanceController from '#controllers/attendance.controller.js';

const attendanceController = new AttendanceController();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('student_image'), attendanceController.create);
router.get('/', attendanceController.getAll);
router.delete('/:id', attendanceController.deleteAttendance);

export default router;
