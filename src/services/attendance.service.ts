import Student from '#models/Student.js';
import getFaceEncoding from '#utils/getFaceEncodong.js';
import FaceDetectionResponse from '#types/api.js';

class AttendanceService {
  // public getByFaceEncoding = async (faceEncodings: number[][]) => {
  //   let results = [];
  //   for (let index = 0; index < faceEncodings.length; index++) {
  //     const currentResult = await Student.aggregate([
  //       {
  //         $vectorSearch: {
  //           index: 'vector_index', // Must match the name you gave it in Atlas
  //           path: 'faceEncoding',
  //           queryVector: faceEncodings[index],
  //           numCandidates: 100,
  //           limit: 1,
  //         },
  //       },
  //       {
  //         $project: {
  //           fullName: 1,
  //           email: 1,
  //           score: { $meta: 'vectorSearchScore' }, // Get the similarity score
  //         },
  //       },
  //     ]);
  //     results.push(currentResult[0]);
  //   }
  //   return results;
  // };

  public getByFaceEncoding = async (faceEncodings: number[][]) => {
    const promises = faceEncodings.map((encodingVec) =>
      Student.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // Must match the name you gave it in Atlas
            path: 'faceEncoding',
            queryVector: encodingVec,
            numCandidates: 100,
            limit: 1,
          },
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            studentNo: 1,
            department: 1,
            phone: 1,
            score: { $meta: 'vectorSearchScore' }, // Get the similarity score
          },
        },
      ])
    );

    const results = await Promise.all(promises);
    return results.map((r) => r[0]);
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

// public getByFaceEncoding = async (faceEncodings: number[][]) => {
//   // Use Promise.all to run vector searches concurrently for massive speed gains
//   const results = await Promise.all(
//     faceEncodings.map(async (encoding) => {
//       const currentResult = await Student.aggregate([
//         {
//           $vectorSearch: {
//             index: 'vector_index',
//             path: 'faceEncoding',
//             queryVector: encoding,
//             numCandidates: 100,
//             limit: 1,
//           },
//         },
//         // 1. "Populate" the referenced data
//         {
//           $lookup: {
//             from: 'Student', // MUST be the exact collection name in your MongoDB database (usually plural/lowercase)
//             localField: 'student', // The field in your Student schema that points to the user
//             foreignField: '_id', // The field in the target collection (usually _id)
//             as: 'studentDetails', // The temporary array name to store the joined data
//           },
//         },
//         // 2. Flatten the array created by $lookup into a single object
//         {
//           $unwind: {
//             path: '$studentDetails',
//             preserveNullAndEmptyArrays: true, // Prevents the whole record from dropping if the user isn't found
//           },
//         },
//         // 3. Project the fields you actually want to return
//         {
//           $project: {
//             _id: 1,
//             fullName: '$studentDetails.fullName', // Grab fields from the unwound object
//             email: '$studentDetails.email',
//             score: { $meta: 'vectorSearchScore' },
//           },
//         },
//       ]);

//       return currentResult[0];
//     })
//   );

//   // Filter out undefined values in case any vector search returned 0 matches
//   return results.filter(Boolean);
// };
