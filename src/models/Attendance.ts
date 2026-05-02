import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    status: {
      enum: ['Present', 'Absent', 'Late'],
      required: true,
      type: String,
    },
    student: {
      ref: 'Student',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Attendence', attendanceSchema);
