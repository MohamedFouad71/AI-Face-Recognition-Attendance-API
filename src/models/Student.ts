import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  department: {
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  faceEncoding: {
    type: [Number],
    required: true,
  },
  fullName: {
    required: true,
    type: String,
  },
  phone: {
    required: true,
    type: String,
  },
  studentNo: {
    required: true,
    type: String,
    unique: true,
  },
});

export default mongoose.model('Student', studentSchema);
