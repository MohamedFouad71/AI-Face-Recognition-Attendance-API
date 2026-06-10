import User from '#models/User.js';
import AuthService from '#services/auth.service.js';
import OperationalError from '#utils/operationalError.js';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

class AuthController {
  private authService = new AuthService();
  public register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const { email, name, password, passwordConfirm, photo, adminToken } = req.body;

      // first line of defense, it also validates data before it reaches the database level for better preformance
      if (!email || !password || !passwordConfirm || !name) {
        throw new OperationalError('Missing Required Fields', 400);
      }

      // check password strength and if password and password confirm match
      // it will throw an error if the validation fails
      this.authService.validatePassword(password, passwordConfirm);

      const user = await this.authService.createUser({
        email,
        name,
        password,
        passwordConfirm,
        adminToken,
        photo,
      });

      const token = this.authService.jwtSign(user._id);

      return res.status(201).json({
        success: true,
        message: 'User Created Succesfully',
        data: { token },
      });
    }
  );

  public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) throw new OperationalError('Missing Required Fields', 400);

    const user = await this.authService.getByEmail(email);
    if (!user) throw new OperationalError('Invalid Email or Password', 401);

    if (!(await this.authService.isPasswordCorrect(user, password)))
      throw new OperationalError('Invalid Email or Password', 401);

    const token = this.authService.jwtSign(user._id);
    res.status(200).json({
      success: true,
      message: 'Signed in Successfully',
      data: { token },
    });
  });

  public forgetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) throw new OperationalError('Invalid Email', 401);
    const user = await this.authService.getByEmail(email);
    if (!user) throw new OperationalError('Invalid Email or Password', 401);
    const resetToken = await this.authService.createResetToken(user);

    await this.authService.sendResetTokenByEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Reset Token Sent Successfully',
      data: [],
    });
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const resetToken: string = String(req.params.resetToken);
    if (!resetToken) throw new OperationalError('Missing Reset Token', 403);

    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm) {
      throw new OperationalError('Missing Required Fields', 400);
    }

    await this.authService.resetPassword(resetToken, password, passwordConfirm);

    res.status(200).json({
      success: true,
      message: 'Password Reset Successfully',
      data: [],
    });
  });

  public protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string;

    // get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      throw new OperationalError('Unauthorized Access', 401);
    }

    if (!token) throw new OperationalError('Unauthorized Access', 401);

    // verify token
    const decoded = await this.authService.verifyToken(token);
    console.log('decoded: ', decoded);

    const user = await User.findById(decoded.id);
    console.log('user: ', user);
    if (!user) throw new OperationalError('Unauthorized Access', 401);

    req.user = user;

    if (process.env.NODE_ENV === 'development') {
      console.log('role: ', req.user.role);
    }
    next();
  });

  public adminProtect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.user || req.user.role !== 'admin')
      throw new OperationalError('Unauthorized Access', 401);

    next();
  });
}

export default AuthController;
