export interface BoundingBox {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface FaceData {
  bounding_box: BoundingBox;
  confidence: number;
  embedding: number[]; // This is what you save to Redis!
  face_index: number;
}

// 2. Define exactly what an ERROR looks like
export interface FaceDetectionError {
  error_code?: string; // Kept optional just in case your API sometimes omits it
  message: string;
  processing_time_ms: number;
  status: 'error';
}

// 1. Define exactly what a SUCCESS looks like
export interface FaceDetectionSuccess {
  data: FaceData[];
  faces_count: number;
  processing_time_ms: number;
  status: 'success';
}

// 3. Combine them into your default export
type FaceDetectionResponse = FaceDetectionError | FaceDetectionSuccess;

export default FaceDetectionResponse;
