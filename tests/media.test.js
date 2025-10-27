import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Media API', () => {
  test('should upload an image and return url', async () => {
    const buffer = Buffer.from('fake image content');
    const response = await request(app)
      .post('/media')
      .attach('file', buffer, 'test.png');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
  });
});
