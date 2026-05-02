import Student from '#models/Student.js';
import getFaceEncoding from '#utils/getFaceEncodong.js';
import FaceDetectionResponse from '#types/api.js';

class AttendanceService {
  public getByFaceEncoding = async (faceEncodings: number[][]) => {
    let results = [];
    for (let index = 0; index < faceEncodings.length; index++) {
      const currentResult = await Student.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // Must match the name you gave it in Atlas
            path: 'faceEncoding',
            queryVector: faceEncodings[index],
            numCandidates: 100,
            limit: 1,
          },
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            score: { $meta: 'vectorSearchScore' }, // Get the similarity score
          },
        },
      ]);
      results.push(currentResult[0]);
    }
    return results;
  };

  public getEncodingFromAI = async (imageBuffer: Buffer) => {
    let responseData: FaceDetectionResponse;

    try {
      responseData = await getFaceEncoding(imageBuffer);
    } catch (error: any) {
      console.error('Error: while sending axios request', error.message || error);
      throw new Error('Internal server error from AI service');
    }

    if (responseData.status === 'error') {
      console.error('Error: AI service returned error');
      throw new Error(responseData.message);
    }
    return responseData;
  };
}

export default AttendanceService;
