import axios from 'axios';
import FormData from 'form-data';

const getFaceEncoding = async (imageBuffer: Buffer) => {
  if (!imageBuffer) {
    console.error('Image buffer is required');
    throw new Error('Image is required');
  }

  if (!process.env.AI_EXTRACT_FACE_URL) {
    console.error('AI_EXTRACT_FACE_URL enviroment variable is not defined');
    throw new Error('AI_EXTRACT_FACE_URL enviroment variable is not defined');
  }

  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'upload.jpg',
    contentType: 'image/jpeg',
  });

  const response = await axios.post(process.env.AI_EXTRACT_FACE_URL as string, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  return response.data;
};

export default getFaceEncoding;
