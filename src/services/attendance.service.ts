import Student from '#models/Student.js';
import Attendance from '#models/Attendance.js';
import { FaceDetectionSuccess } from '#types/api.js';
import VectordbResultType from '#types/vectorDBResults.js';
import { ObjectId } from 'mongoose';
import OperationalError from '#utils/operationalError.js';

class AttendanceService {
  public getByFaceEncoding = async (responseData: FaceDetectionSuccess) => {
    const faceEncodings: number[][] = responseData.data.map((data) => data.embedding);

    const promises = faceEncodings.map((encodingVec) =>
      Student.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // Must match the name you gave it in Atlas
            path: 'faceEncoding',
            queryVector: encodingVec,
            numCandidates: 100,
            limit: 1,
          },
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            studentNo: 1,
            department: 1,
            phone: 1,
            score: { $meta: 'vectorSearchScore' }, // Get the similarity score
          },
        },
      ])
    );

    const results = await Promise.all(promises);
    return results.map((r) => r[0]).filter((match) => match !== undefined && match.score >= 0.85);
  };

  public registerAttendaces = async (studentsToRegister: VectordbResultType[]) => {
    const isRegistered = new Set<string>();

    const uniqueStudents = studentsToRegister.filter((st) => {
      // @ts-ignore
      const stringId = st._id.toString();

      if (isRegistered.has(stringId)) return false;

      isRegistered.add(stringId);
      return true;
    });

    const attendancePayloads = uniqueStudents.map((st) => ({
      status: 'Present',
      student: st._id,
    }));

    const attendances = await Attendance.insertMany(attendancePayloads);
    const populatedAttendances = await Attendance.populate(attendances, {
      path: 'student',
      select: 'fullName studentNo email',
    });

    return populatedAttendances;
  };

  public deleteById = async (id: any) => {
    const attendance = await Attendance.findOneAndDelete({ _id: id });
    if (!attendance) {
      throw new OperationalError('No Registered Attendance With Such ID', 404);
    }
  };
}

export default AttendanceService;
