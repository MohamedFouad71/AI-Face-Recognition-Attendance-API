import expressAsyncHandler from 'express-async-handler';

import redisClient from '#config/redis.js';
import Student from '#models/Student.js';

// @TODO: email validation, send email to the student.
// json example
/*
{
  "fullName": "John Doe",
  "studentNo": "123456789",
  "department": "Computer Science",
  "email": "[EMAIL_ADDRESS]",
  "phone": "123456789",
  "upload_token": "123456789"
}
*/
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
}
