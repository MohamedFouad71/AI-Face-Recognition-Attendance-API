import axios from 'axios';
import FormData from 'form-data';

import FaceDetectionResponse, { FaceDetectionSuccess } from '#types/api.js';
import OperationalError from '#utils/operationalError.js';
import redisClient from '#config/redis.js';

class ImageService {
  public storeInRedis = async (faceEncoding: number[] | undefined) => {
    const uploadToken = crypto.randomUUID();
    const redisKey = `upload_token:${uploadToken}`;
    await redisClient.setEx(redisKey, 15 * 60, JSON.stringify(faceEncoding));

    return uploadToken;
  };
}

export default ImageService;
