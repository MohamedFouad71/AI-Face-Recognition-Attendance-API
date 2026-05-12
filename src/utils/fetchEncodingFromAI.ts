import axios from 'axios';
import FormData from 'form-data';
import OperationalError from './operationalError.js';
import { FaceDetectionSuccess } from '#types/api.js';

const fetchEncodingFromAI = async (imageBuffer: Buffer) => {
  if (!imageBuffer) throw new OperationalError('No image Provided', 400);

  if (!process.env.AI_EXTRACT_FACE_URL)
    throw new Error('AI_EXTRACT_FACE_URL enviroment variable is not defined');

  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'upload.jpg',
    contentType: 'image/jpeg',
  });

  const response = await axios
    .post(process.env.AI_EXTRACT_FACE_URL as string, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })
    .catch((err) => {
      if (err.response)
        throw new Error(
          `AI Service returned ${err.response.status}: ${JSON.stringify(err.response.data)}`
        );
      throw new Error(err);
    });

  const responseData: FaceDetectionSuccess = response.data;

  if (responseData.faces_count !== 1)
    throw new OperationalError('Image Must Contain One and Only One Face', 400);

  return responseData;
};

export default fetchEncodingFromAI;
