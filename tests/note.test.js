import request from 'supertest';
import app from '../src/app.js';

describe('Notes API', () => {
  let noteId;

  test('POST /notes creates a note', async () => {
    const res = await request(app)
      .post('/notes')
      .send({ title: 'Test Note', content: 'Content' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Note');
    noteId = res.body.id;
  });

  test('GET /notes returns list including created note', async () => {
    const res = await request(app).get('/notes').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const note = res.body.find(n => n.id === noteId);
    expect(note).toBeDefined();
    expect(note.title).toBe('Test Note');
  });

  test('GET /notes/:id returns the note', async () => {
    const res = await request(app).get(`/notes/${noteId}`).expect(200);
    expect(res.body.id).toBe(noteId);
    expect(res.body.title).toBe('Test Note');
  });

  test('PUT /notes/:id updates the note', async () => {
    const res = await request(app)
      .put(`/notes/${noteId}`)
      .send({ title: 'Updated', content: 'New' })
      .expect(200);
    expect(res.body.title).toBe('Updated');
  });

  test('DELETE /notes/:id deletes the note', async () => {
    await request(app).delete(`/notes/${noteId}`).expect(204);
    await request(app).get(`/notes/${noteId}`).expect(404);
  });
});
