import { randomUUID } from 'crypto';

// In-memory storage for notes. In a real application this would be replaced with a database layer.
const notes = new Map();

/**
 * Validate note data.
 * @param {object} data
 * @param {string} data.title
 * @param {string} data.content
 */
function validateNoteData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Note data must be an object');
  }
  const { title, content } = data;
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('Title is required and must be a non‑empty string');
  }
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }
}

/**
 * Create a new note.
 * @param {object} data
 * @returns {Promise<object>} The created note.
 */
export async function createNote(data) {
  validateNoteData(data);
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const note = {
    id,
    title: data.title.trim(),
    content: data.content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  notes.set(id, note);
  return note;
}

/**
 * Retrieve a note by its identifier.
 * @param {string} id
 * @returns {Promise<object>} The note.
 */
export async function getNoteById(id) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid note id');
  }
  const note = notes.get(id);
  if (!note) {
    throw new Error('Note not found');
  }
  return note;
}

/**
 * Retrieve all notes.
 * @returns {Promise<Array<object>>}
 */
export async function getAllNotes() {
  return Array.from(notes.values());
}

/**
 * Update an existing note.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} The updated note.
 */
export async function updateNote(id, data) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid note id');
  }
  const existing = notes.get(id);
  if (!existing) {
    throw new Error('Note not found');
  }
  // Allow partial updates but validate fields when present.
  const updatedFields = {};
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      throw new Error('Title must be a non‑empty string');
    }
    updatedFields.title = data.title.trim();
  }
  if (data.content !== undefined) {
    if (typeof data.content !== 'string') {
      throw new Error('Content must be a string');
    }
    updatedFields.content = data.content;
  }
  const updatedAt = new Date().toISOString();
  const updatedNote = {
    ...existing,
    ...updatedFields,
    updatedAt,
  };
  notes.set(id, updatedNote);
  return updatedNote;
}

/**
 * Delete a note by its identifier.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid note id');
  }
  if (!notes.has(id)) {
    throw new Error('Note not found');
  }
  notes.delete(id);
}

export default {
  createNote,
  getNoteById,
  getAllNotes,
  updateNote,
  deleteNote,
};
