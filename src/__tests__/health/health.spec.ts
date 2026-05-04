import { describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 with success ok', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'ok' });
  });
});
