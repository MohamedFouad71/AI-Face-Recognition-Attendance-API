import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: [true, 'a user with the same email already exists'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password with minimum length of 8 chars'],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // active: {
  //   type: Boolean,
  //   default: true,
  //   select: false,
  // },
});

const User = mongoose.model('User', userSchema);
export default User;
