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

    const attendancePayloads = results.map((result) => ({
      status: 'Present',
      student: result._id,
    }));

    const attendances = await Attendance.insertMany(attendancePayloads);

    const populatedAttendances = await Attendance.populate(attendances, {
      path: 'student',
      select: 'fullName studentNo email',
    });

    res.status(200).json({
      success: true,
      msg: `Successfully registered ${populatedAttendances.length} students`,
      data: populatedAttendances,
    });
  });

  public getAll = expressAsyncHandler(async (req, res) => {
    // Get query
    let queryObject = { ...req.query };
    const exclude: string[] = ['sort', 'page', 'limit'];
    exclude.forEach((el) => delete queryObject[el]);

    const queryStr = JSON.stringify(queryObject).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    queryObject = JSON.parse(queryStr);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // execute Query
    const attendances = await Attendance.find(queryObject)
      .populate('student')
      .select('status')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

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
