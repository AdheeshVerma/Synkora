import request from 'supertest';
import app from '../src/app.js';

const testUser = { email: 'testuser@example.com', password: 'Password123' };

describe('Auth API', () => {
  afterAll(async () => {
    if (app && app.close) {
      await app.close();
    }
  });

  test('Register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('Register with existing email should fail', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login with wrong password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});