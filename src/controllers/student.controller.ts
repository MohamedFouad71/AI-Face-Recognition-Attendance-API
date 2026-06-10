import asyncHandler from 'express-async-handler';

import redisClient from '#config/redis.js';
import Student from '#models/Student.js';
import OperationalError from '#utils/operationalError.js';

// @TODO: email validation, send email to the student.
export default class StudentController {
  public create = asyncHandler(async (req, res): Promise<any> => {
    const { department, email, fullName, phone, studentNo, upload_token } = req.body;

    if (!upload_token) throw new OperationalError('upload_token is required', 400);
    if (!fullName || !studentNo || !email || !phone || !department)
      throw new OperationalError('Missing required fields', 400);

    const redisKey = `upload_token:${upload_token}`;
    const cachedEncoding = await redisClient.get(redisKey);

    if (!cachedEncoding) throw new OperationalError('image session is expired or not valid', 400);

    const student = await Student.create({
      department,
      email,
      faceEncoding: JSON.parse(cachedEncoding),
      fullName,
      phone,
      studentNo,
    });

    await redisClient.del(redisKey);
    return res.status(201).json({
      data: {
        department,
        email,
        fullName,
        phone,
        studentNo,
      },
      message: 'Student created successfully',
      success: true,
    });
  });

  public getAll = asyncHandler(async (req, res): Promise<any> => {
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

    // Excute Query
    const students = await Student.find(queryObject)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .select('-faceEncoding -__v');
    // Return Response
    return res.status(200).json({
      data: students,
      message: 'Students fetched successfully',
      success: true,
    });
  });

  public getById = asyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;

    if (!id) throw new OperationalError('ID is Required', 404);

    const student = await Student.findById(id).select('-faceEncoding -__v');
    if (!student) throw new OperationalError('Student Not Found', 404);

    return res.status(200).json({
      data: student,
      message: 'Student fetched successfully',
      success: true,
    });
  });

  public update = asyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;
    if (!id) throw new OperationalError('Student Not Found', 404);

    const { department, email, fullName, phone, studentNo } = req.body;

    const student = await Student.findById(id).select('-faceEncoding -__v');
    if (!student) throw new OperationalError('Student Not Found', 404);

    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (fullName) student.fullName = fullName;
    if (studentNo) student.studentNo = studentNo;
    if (department) student.department = department;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  });

  public delete = asyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;
    if (!id) throw new OperationalError('Student Not Found', 404);

    const student = await Student.findById(id);
    if (!student) throw new OperationalError('Student Not Found', 404);

    await student.deleteOne();
    return res.status(204).send();
  });
}
