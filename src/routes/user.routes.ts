import { Router } from 'express';
import AuthController from '#controllers/auth.controller.js';

const userRouter = Router();
const authController = new AuthController();

userRouter.post('/register', authController.register);
userRouter.post('/login', authController.login);
userRouter.post('/forget-password', authController.forgetPassword);
userRouter.patch('/reset-password/:resetToken', authController.resetPassword);

export default userRouter;
