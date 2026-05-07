import expressAsyncHandler from 'express-async-handler';

import redisClient from '#config/redis.js';
import Student from '#models/Student.js';

// @TODO: email validation, send email to the student.
export default class StudentController {
  public create = expressAsyncHandler(async (req, res): Promise<any> => {
    const { department, email, fullName, phone, studentNo, upload_token } = req.body;

    if (!upload_token)
      return res.status(400).json({ error: 'upload_token is required', success: false });
    if (!fullName || !studentNo || !email || !phone || !department)
      return res.status(400).json({ error: 'Missing required fields', success: false });

    const redisKey = `upload_token:${upload_token}`;
    const cachedEncoding = await redisClient.get(redisKey);

    if (!cachedEncoding)
      return res
        .status(400)
        .json({ error: 'image session is expired or not valid', success: false });

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

  public getAll = expressAsyncHandler(async (req, res): Promise<any> => {
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

  public getById = expressAsyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'id is required', success: false });

    const student = await Student.findById(id).select('-faceEncoding -__v');
    if (!student) return res.status(404).json({ error: 'student not found', success: false });

    return res.status(200).json({
      data: student,
      message: 'Student fetched successfully',
      success: true,
    });
  });

  public update = expressAsyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;
    const { department, email, fullName, phone, studentNo } = req.body;

    if (!id) return res.status(400).json({ error: 'id is required', success: false });

    const student = await Student.findById(id).select('-faceEncoding -__v');
    if (!student) return res.status(404).json({ error: 'student not found', success: false });

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

  public delete = expressAsyncHandler(async (req, res): Promise<any> => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'id is required', success: false });

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: 'student not found', success: false });

    await student.deleteOne();
    return res.status(204).send();
  });
}
