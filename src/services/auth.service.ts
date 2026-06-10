import OperationalError from '#utils/operationalError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { HydratedDocFromModel } from 'mongoose';
import crypto from 'crypto';

import User from '#models/User.js';
import sendEmail from '#utils/sendEmail.js';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  adminToken?: string;
  photo?: string;
}

class AuthService {
  public validatePassword = (password: string, passwordConfirm: string) => {
    if (password !== passwordConfirm) throw new OperationalError('Passwords Does not Match', 401);

    if (password.length < 8 || password.length > 64)
      throw new OperationalError('Password Must be Between 8 and 64 Characters', 401);

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
      throw new OperationalError(
        'Password Must Contain Uppercase, Lowercase, Digit and Special Character',
        401
      );
    }
  };

  public createUser = async (userData: CreateUserInput) => {
    userData.password = await bcrypt.hash(userData.password, 12);

    const { name, email, password, photo } = userData;
    const role = userData.adminToken === process.env.ADMIN_CREATION_TOKEN ? 'admin' : 'user';

    // uniqueness of email address is already validated in the data layer and the error handler and accesses database,
    // adding it will be redundent and will waste resources

    return User.create({ name, email, password, photo, role });
  };

  public jwtSign = (id: mongoose.Types.ObjectId) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    if (!secret || !expiresIn) {
      throw new Error('ERROR: Missing JWT environment variables');
    }

    // @ts-ignore
    return jwt.sign({ id }, secret, {
      expiresIn: expiresIn,
    });
  };

  public getByEmail = async (email: string) => {
    return User.findOne({ email }).select('email password');
  };

  public isPasswordCorrect = async (user: any, providedPassword: string) => {
    return bcrypt.compare(providedPassword, user.password);
  };

  public createResetToken = async (user: HydratedDocFromModel<typeof User>): Promise<string> => {
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();
    return resetToken;
  };

  public sendResetTokenByEmail = async (email: string, resetToken: string) => {
    const message = `Your Password Reset Token is ${resetToken}`;
    const isSentSuccessfully = await sendEmail(email, message);

    if (!isSentSuccessfully) throw new Error('ERROR: Email Sending Failed');
  };

  public resetPassword = async (
    resetToken: string,
    newPassword: string,
    passwordConfirm: string
  ) => {
    this.validatePassword(newPassword, passwordConfirm);

    const user = await User.findOne({
      passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new OperationalError('Invalid or Expired Token', 401);

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  };

  public verifyToken = (token: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('ERROR: Missing JWT environment variables');
    }

    // returns the decoded token if valid, otherwise throws an error
    return jwt.verify(token, secret);
  };
}

export default AuthService;
