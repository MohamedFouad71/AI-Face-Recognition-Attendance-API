import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { FaceDetectionSuccess } from '#types/api.js';
import ImageService from '#services/image.service.js';
import fetchEncodingFromAI from '#utils/fetchEncodingFromAI.js';

export default class ImageController {
  private imageService = new ImageService();

  public getFaceEncoding = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const imageBuffer = req.file?.buffer;
    // @ts-ignore
    const responseData: FaceDetectionSuccess = await fetchEncodingFromAI(imageBuffer);

    const uploadToken = await this.imageService.storeInRedis(responseData?.data.at(0)?.embedding);

    return res.status(200).json({
      data: {
        upload_token: uploadToken,
      },
      message: 'Image processed successfully',
      success: true,
    });
  });
}
