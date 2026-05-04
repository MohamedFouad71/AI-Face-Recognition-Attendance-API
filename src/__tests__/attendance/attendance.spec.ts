import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import Attendance from '#models/Attendance.js';
import AttendanceService from '#services/attendance.service.js';

// ── Mock external dependencies ──────────────────────────────────────────────
vi.mock('#models/Attendance.js', () => {
  const MockAttendance: Record<string, Mock> = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    deleteOne: vi.fn(),
  };
  return { default: MockAttendance };
});

vi.mock('#models/Student.js', () => ({
  default: {
    aggregate: vi.fn(),
  },
}));

vi.mock('#config/redis.js', () => ({
  default: {
    get: vi.fn(),
    del: vi.fn(),
    setEx: vi.fn(),
  },
}));

vi.mock('#config/db.js', () => ({ default: vi.fn() }));

vi.mock('#services/attendance.service.js', () => {
  const MockService = vi.fn();
  MockService.prototype.getEncodingFromAI = vi.fn();
  MockService.prototype.getByFaceEncoding = vi.fn();
  return { default: MockService };
});

// ── Helpers ─────────────────────────────────────────────────────────────────
const BASE = '/api/v1/attendances';

const fakeAttendanceDoc = {
  _id: '507f1f77bcf86cd799439022',
  status: 'Present',
  student: '507f1f77bcf86cd799439011',
  createdAt: '2026-05-04T12:00:00.000Z',
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/attendances
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/attendances', () => {
  it('should return 400 when no image is provided', async () => {
    const res = await request(app).post(BASE);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/image/i);
  });

  it('should return 200 with empty data when no matching face is found', async () => {
    const service = AttendanceService.prototype;
    (service.getEncodingFromAI as Mock).mockResolvedValue({
      status: 'success',
      faces_count: 1,
      data: [{ embedding: [0.1, 0.2], face_index: 0, confidence: 0.99, bounding_box: {} }],
    });
    (service.getByFaceEncoding as Mock).mockResolvedValue([]);

    const res = await request(app)
      .post(BASE)
      .attach('student_image', Buffer.from('fake-image'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 200 with attendance records when faces are matched', async () => {
    const service = AttendanceService.prototype;
    (service.getEncodingFromAI as Mock).mockResolvedValue({
      status: 'success',
      faces_count: 1,
      data: [{ embedding: [0.1, 0.2], face_index: 0, confidence: 0.99, bounding_box: {} }],
    });
    (service.getByFaceEncoding as Mock).mockResolvedValue([
      { _id: '507f1f77bcf86cd799439011', fullName: 'John Doe', email: 'john@test.com', score: 0.98 },
    ]);
    (Attendance.create as Mock).mockResolvedValue(fakeAttendanceDoc);

    const res = await request(app)
      .post(BASE)
      .attach('student_image', Buffer.from('fake-image'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(Attendance.create).toHaveBeenCalledOnce();
  });

  it('should return 500 when AI service throws an error', async () => {
    const service = AttendanceService.prototype;
    (service.getEncodingFromAI as Mock).mockRejectedValue(new Error('AI service down'));

    const res = await request(app)
      .post(BASE)
      .attach('student_image', Buffer.from('fake-image'), 'test.jpg');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/attendances
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/attendances', () => {
  it('should return 200 with a list of attendances', async () => {
    const chainMock = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([fakeAttendanceDoc]),
    };
    (Attendance.find as Mock).mockReturnValue(chainMock);

    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 200 with empty data message when no attendances exist', async () => {
    const chainMock = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(null),
    };
    (Attendance.find as Mock).mockReturnValue(chainMock);

    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/attendances/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/v1/attendances/:id', () => {
  it('should return 204 when attendance is deleted successfully', async () => {
    (Attendance.findById as Mock).mockResolvedValue(fakeAttendanceDoc);
    (Attendance.deleteOne as Mock).mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`${BASE}/507f1f77bcf86cd799439022`);

    expect(res.status).toBe(204);
    expect(Attendance.deleteOne).toHaveBeenCalledOnce();
  });

  it('should return 404 when attendance is not found', async () => {
    (Attendance.findById as Mock).mockResolvedValue(null);

    const res = await request(app).delete(`${BASE}/507f1f77bcf86cd799439022`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});
