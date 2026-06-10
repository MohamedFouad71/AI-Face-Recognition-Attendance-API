import { Router } from 'express';

import StudentController from '#controllers/student.controller.js';
import AuthController from '#controllers/auth.controller.js';

const studentRouter = Router();
const studentController = new StudentController();
const authController = new AuthController();

studentRouter.post(
  '/',
  authController.protect,
  authController.adminProtect,
  studentController.create
);
studentRouter.get('/', authController.protect, studentController.getAll);
studentRouter.get('/:id', authController.protect, studentController.getById);
studentRouter.patch(
  '/:id',
  authController.protect,
  authController.adminProtect,
  studentController.update
);
studentRouter.delete(
  '/:id',
  authController.protect,
  authController.adminProtect,
  studentController.delete
);

export default studentRouter;
