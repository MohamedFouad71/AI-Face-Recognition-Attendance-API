import { ObjectId } from 'mongoose';

interface VectordbResultType {
  _id: ObjectId;
  email: string;
  fullName: string;
  score: number;
}

export default VectordbResultType;
