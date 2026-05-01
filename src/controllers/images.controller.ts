import axios from 'axios';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import FormData from 'form-data';

import redisClient from '#config/redis.js';
import FaceDetectionResponse from '#types/api.js';

export default class ImageController {
  public getFaceEncoding = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer)
      return res.status(400).json({ error: 'image is not provided', success: false });

    if (!process.env.AI_EXTRACT_FACE_URL) {
      console.error('Error: missing AI_EXTRACT_FACE_URL enviromental variable ');
      return res.status(500).json({ error: 'Internal server error', success: false });
    }

    const form = new FormData();
    form.append('image', req.file?.buffer, req.file?.originalname);

    const response = await axios.post(process.env.AI_EXTRACT_FACE_URL, form, {
      headers: {
        ...form.getHeaders(), // This injects the proper 'multipart/form-data' boundaries
      },
    });

    const responseData: FaceDetectionResponse = response.data;

    if (responseData.status === 'error') {
      console.error('Error: Ai service');
      console.error(responseData);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }

    console.log(responseData?.faces_count);
    if (responseData?.faces_count !== 1)
      return res.status(400).json({
        error: 'the image must at least one and only one face',
        success: false,
      });

    const uploadToken = crypto.randomUUID();
    const redisKey = `upload_token:${uploadToken}`;
    await redisClient.setEx(redisKey, 15 * 60, JSON.stringify(responseData?.data.at(0)?.embedding));

    return res.status(200).json({
      data: {
        upload_token: uploadToken,
      },
      message: 'Image processed successfully',
      success: true,
    });
  });
}
