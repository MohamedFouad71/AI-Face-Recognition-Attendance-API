import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import redisClient from '#config/redis.js';
import FaceDetectionResponse from '#types/api.js';
import getFaceEncoding from '#utils/getFaceEncodong.js';

export default class ImageController {
  public getFaceEncoding = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer)
      return res.status(400).json({ error: 'image is not provided', success: false });

    let responseData: FaceDetectionResponse;

    try {
      responseData = await getFaceEncoding(imageBuffer);
    } catch (error: any) {
      console.error('Error: while sending axios request', error.message || error);
      return res
        .status(500)
        .json({ error: 'Internal server error from AI service', success: false });
    }

    if (responseData.status === 'error') {
      console.error('Error: Ai service ');
      console.error(responseData);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }

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
