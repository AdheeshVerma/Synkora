import express from 'express';
import { createNote, getAllNotes, getNote, updateNote, deleteNote } from '../controllers/noteController.js';

const router = express.Router();

router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
