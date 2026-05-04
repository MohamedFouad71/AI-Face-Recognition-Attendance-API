import expressAsyncHandler from 'express-async-handler';

import Attendance from '#models/Attendance.js';
import Student from '#models/Student.js';
import FaceDetectionResponse from '#types/api.js';
import getFaceEncoding from '#utils/getFaceEncodong.js';
import AttendanceService from '#services/attendance.service.js';
import { ObjectId } from 'mongodb';

const attendenceService = new AttendanceService();

// faceEncodings -> vectordb
// [
//   [
//     {
//       _id: new ObjectId('69f5cac271c5fed9d05645dd'),
//       email: '[EMAIL_ADDRESasdad]',
//       fullName: 'Moaemd Doe',
//       score: 1
//     }
//   ]
// ]

interface VectordbResultType {
  _id: ObjectId;
  email: string;
  fullName: string;
  score: number;
}

class AttendanceController {
  public create = expressAsyncHandler(async (req, res): Promise<any> => {
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer)
      return res.status(400).json({ error: 'image is not provided', success: false });

    let responseData: FaceDetectionResponse;
    try {
      responseData = await attendenceService.getEncodingFromAI(imageBuffer);
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }

    const faceEncodings = responseData.data.map((data) => data.embedding);
    // array of objects [results]
    const results: VectordbResultType[] = await attendenceService.getByFaceEncoding(faceEncodings);
    console.log(results);

    if (!results.length)
      return res.status(200).json({ msg: 'No matching face found', success: true, data: [] });

    const attendances = [];
    for (let i = 0; i < results.length; i++) {
      const attendance = await Attendance.create({ status: 'Present', student: results[i]._id });
      attendances.push(attendance);
    }

    res.status(200).json({
      success: true,
      msg: `Succesfully registered ${attendances.length} students`,
      data: attendances,
    });
  });

  public getAll = expressAsyncHandler(async (req, res) => {
    const attendances = await Attendance.find()
      .populate({ path: 'student', select: 'studentNo fullName -_id' })
      .sort({ createdAt: -1 })
      .select('status createdAt');

    if (!attendances)
      res.status(200).json({ success: true, msg: 'No attendaces recorded yet', data: [] });

    res
      .status(200)
      .json({ success: true, msg: 'Attendances fetched succesfully', data: attendances });
  });

  public deleteAttendance = expressAsyncHandler(async (req, res): Promise<any> => {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ error: 'Attendance not found', success: false });
    await Attendance.deleteOne(attendance);
    return res.status(204).send();
  });
}

export default AttendanceController;
