import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    status: String,
    studentId: { ref: 'Student', type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export default mongoose.model('Attendence', attendanceSchema);
