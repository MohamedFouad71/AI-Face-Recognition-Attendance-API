import asyncHandler from 'express-async-handler';

import Attendance from '#models/Attendance.js';
import FaceDetectionResponse from '#types/api.js';
import AttendanceService from '#services/attendance.service.js';
import fetchEncodingFromAI from '#utils/fetchEncodingFromAI.js';
import VectordbResultType from '#types/vectorDBResults.js';
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

class AttendanceController {
  private attendenceService = new AttendanceService();
  public create = asyncHandler(async (req, res): Promise<any> => {
    const imageBuffer = req.file?.buffer;
    // @ts-ignore
    let responseData: FaceDetectionResponse = await fetchEncodingFromAI(imageBuffer);
    // array of objects [results]
    const studentsMatched: VectordbResultType[] =
      await this.attendenceService.getByFaceEncoding(responseData);

    if (!studentsMatched.length)
      return res.status(200).json({ msg: 'No matching face found', success: true, data: [] });

    const attendaces = await this.attendenceService.registerAttendaces(studentsMatched);

    res.status(200).json({
      success: true,
      msg: `Successfully registered ${attendaces.length} students`,
      data: attendaces,
    });
  });

  public getAll = asyncHandler(async (req, res) => {
    // Get query
    let queryObject = { ...req.query };
    // const query = Attendance.find();
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
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    if (!attendances.length)
      res.status(200).json({ success: true, msg: 'No attendaces recorded yet', data: [] });

    res
      .status(200)
      .json({ success: true, msg: 'Attendances fetched succesfully', data: attendances });
  });

  public deleteAttendance = asyncHandler(async (req, res): Promise<any> => {
    await this.attendenceService.deleteById(req.params.id);
    return res.status(204).send();
  });
}

export default AttendanceController;
