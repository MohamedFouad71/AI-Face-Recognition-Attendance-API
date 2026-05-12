import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import redisClient from '#config/redis.js';
import fetchEncodingFromAI from '#utils/fetchEncodingFromAI.js';
// ── Mock external dependencies ──────────────────────────────────────────────
vi.mock('#config/redis.js', () => ({
  default: {
    get: vi.fn(),
    del: vi.fn(),
    setEx: vi.fn(),
  },
}));

vi.mock('#config/db.js', () => ({ default: vi.fn() }));

vi.mock('#models/Student.js', () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('#models/Attendance.js', () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('#utils/fetchEncodingFromAI.js', () => ({
  default: vi.fn(),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────
const BASE = '/api/v1/images';

const fakeSuccessResponse = {
  status: 'success',
  faces_count: 1,
  processing_time_ms: 120,
  data: [
    {
      embedding: [0.1, 0.2, 0.3],
      face_index: 0,
      confidence: 0.99,
      bounding_box: { x: 10, y: 20, width: 100, height: 100 },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/images/upload
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/images/upload', () => {
  it('should return 400 when no image is provided', async () => {
    const res = await request(app).post(`${BASE}/upload`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/image/i);
  });

  it('should return 200 with upload_token on success', async () => {
    (fetchEncodingFromAI as Mock).mockResolvedValue(fakeSuccessResponse);
    (redisClient.setEx as Mock).mockResolvedValue('OK');

    const res = await request(app)
      .post(`${BASE}/upload`)
      .attach('student_image', Buffer.from('fake-image-data'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.upload_token).toBeDefined();
    expect(res.body.message).toMatch(/processed/i);

    // Verify the encoding was cached in Redis with a 15-minute TTL
    expect(redisClient.setEx).toHaveBeenCalledWith(
      expect.stringContaining('upload_token:'),
      15 * 60,
      expect.any(String)
    );
  });

  it('should return 500 when AI service throws an error', async () => {
    (fetchEncodingFromAI as Mock).mockRejectedValue(new Error('Connection refused'));

    const res = await request(app)
      .post(`${BASE}/upload`)
      .attach('student_image', Buffer.from('fake-image-data'), 'test.jpg');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 when AI service returns an error status', async () => {
    (fetchEncodingFromAI as Mock).mockResolvedValue({
      status: 'error',
      message: 'Processing failed',
      processing_time_ms: 50,
    });

    const res = await request(app)
      .post(`${BASE}/upload`)
      .attach('student_image', Buffer.from('fake-image-data'), 'test.jpg');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when image contains zero or multiple faces', async () => {
    (fetchEncodingFromAI as Mock).mockResolvedValue({
      ...fakeSuccessResponse,
      faces_count: 2,
      data: [
        { embedding: [0.1], face_index: 0, confidence: 0.99, bounding_box: {} },
        { embedding: [0.2], face_index: 1, confidence: 0.98, bounding_box: {} },
      ],
    });

    const res = await request(app)
      .post(`${BASE}/upload`)
      .attach('student_image', Buffer.from('fake-image-data'), 'test.jpg');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/one.*face/i);
  });

  it('should return 400 when no faces are detected', async () => {
    (fetchEncodingFromAI as Mock).mockResolvedValue({
      ...fakeSuccessResponse,
      faces_count: 0,
      data: [],
    });

    const res = await request(app)
      .post(`${BASE}/upload`)
      .attach('student_image', Buffer.from('fake-image-data'), 'test.jpg');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
