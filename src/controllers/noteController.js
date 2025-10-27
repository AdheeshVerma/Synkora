import Note from '../models/note.js';

// Get all notes
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single note by ID
export const getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    console.error(`Error fetching note ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(400).json({ error: 'Invalid note data' });
  }
};

// Update an existing note
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (err) {
    console.error(`Error updating note ${id}:`, err);
    res.status(400).json({ error: 'Invalid update data' });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(`Error deleting note ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
};