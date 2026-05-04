import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import Student from '#models/Student.js';
import redisClient from '#config/redis.js';

// ── Mock external dependencies ──────────────────────────────────────────────
vi.mock('#models/Student.js', () => {
  const MockStudent: Record<string, Mock> = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
  };
  return { default: MockStudent };
});

vi.mock('#config/redis.js', () => ({
  default: {
    get: vi.fn(),
    del: vi.fn(),
    setEx: vi.fn(),
  },
}));

// We also need to mock the db module to prevent it from throwing when MONGO_URI is missing
vi.mock('#config/db.js', () => ({ default: vi.fn() }));

// ── Helpers ─────────────────────────────────────────────────────────────────
const BASE = '/api/v1/students';

const fakeStudentData = {
  department: 'Computer Science',
  email: 'john@test.com',
  fullName: 'John Doe',
  phone: '01012345678',
  studentNo: 'CS-001',
};

const fakeStudentDoc = {
  _id: '507f1f77bcf86cd799439011',
  ...fakeStudentData,
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/students
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/students', () => {
  it('should return 400 when upload_token is missing', async () => {
    const res = await request(app).post(BASE).send(fakeStudentData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/upload_token/i);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post(BASE)
      .send({ upload_token: 'tok-123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/missing required/i);
  });

  it('should return 400 when upload_token is expired / not found in Redis', async () => {
    (redisClient.get as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(BASE)
      .send({ ...fakeStudentData, upload_token: 'expired-token' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/expired|not valid/i);
  });

  it('should create a student and return 201 on success', async () => {
    const fakeEncoding = JSON.stringify([0.1, 0.2, 0.3]);
    (redisClient.get as Mock).mockResolvedValue(fakeEncoding);
    (Student.create as Mock).mockResolvedValue(fakeStudentDoc);
    (redisClient.del as Mock).mockResolvedValue(1);

    const res = await request(app)
      .post(BASE)
      .send({ ...fakeStudentData, upload_token: 'valid-token' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe(fakeStudentData.fullName);
    expect(Student.create).toHaveBeenCalledOnce();
    expect(redisClient.del).toHaveBeenCalledWith('upload_token:valid-token');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/students
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/students', () => {
  it('should return 200 with a list of students', async () => {
    const chainMock = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([fakeStudentDoc]),
    };
    (Student.find as Mock).mockReturnValue(chainMock);

    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].fullName).toBe('John Doe');
  });

  it('should return 200 with empty array when no students exist', async () => {
    const chainMock = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([]),
    };
    (Student.find as Mock).mockReturnValue(chainMock);

    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('should respect pagination parameters', async () => {
    const chainMock = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([]),
    };
    (Student.find as Mock).mockReturnValue(chainMock);

    await request(app).get(`${BASE}?page=2&limit=5`);

    // page 2 with limit 5 → skip = (2-1)*5 = 5
    expect(chainMock.skip).toHaveBeenCalledWith(5);
    expect(chainMock.limit).toHaveBeenCalledWith(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/students/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/students/:id', () => {
  it('should return 200 when student is found', async () => {
    const selectMock = vi.fn().mockResolvedValue(fakeStudentDoc);
    (Student.findById as Mock).mockReturnValue({ select: selectMock });

    const res = await request(app).get(`${BASE}/507f1f77bcf86cd799439011`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe('507f1f77bcf86cd799439011');
  });

  it('should return 404 when student is not found', async () => {
    const selectMock = vi.fn().mockResolvedValue(null);
    (Student.findById as Mock).mockReturnValue({ select: selectMock });

    const res = await request(app).get(`${BASE}/507f1f77bcf86cd799439011`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/students/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /api/v1/students/:id', () => {
  it('should return 200 and update the student on success', async () => {
    const studentDoc = {
      ...fakeStudentDoc,
      save: vi.fn().mockResolvedValue(true),
    };
    const selectMock = vi.fn().mockResolvedValue(studentDoc);
    (Student.findById as Mock).mockReturnValue({ select: selectMock });

    const res = await request(app)
      .patch(`${BASE}/507f1f77bcf86cd799439011`)
      .send({ fullName: 'Jane Doe' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(studentDoc.fullName).toBe('Jane Doe');
    expect(studentDoc.save).toHaveBeenCalledOnce();
  });

  it('should return 404 when student to update is not found', async () => {
    const selectMock = vi.fn().mockResolvedValue(null);
    (Student.findById as Mock).mockReturnValue({ select: selectMock });

    const res = await request(app)
      .patch(`${BASE}/507f1f77bcf86cd799439011`)
      .send({ fullName: 'Jane Doe' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/students/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/v1/students/:id', () => {
  it('should return 204 when student is deleted successfully', async () => {
    const studentDoc = {
      ...fakeStudentDoc,
      deleteOne: vi.fn().mockResolvedValue(true),
    };
    (Student.findById as Mock).mockResolvedValue(studentDoc);

    const res = await request(app).delete(`${BASE}/507f1f77bcf86cd799439011`);

    expect(res.status).toBe(204);
    expect(studentDoc.deleteOne).toHaveBeenCalledOnce();
  });

  it('should return 404 when student to delete is not found', async () => {
    (Student.findById as Mock).mockResolvedValue(null);

    const res = await request(app).delete(`${BASE}/507f1f77bcf86cd799439011`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
