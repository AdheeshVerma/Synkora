import express from 'express';
import multer from 'multer';
import { getMedia, createMedia, deleteMedia } from '../controllers/mediaController.js';

const router = express.Router();

// Configure multer to store files in memory; adjust as needed for production.
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

/**
 * @route GET /media/:id
 * @desc Retrieve a media resource by its identifier.
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await getMedia(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    // Assuming result contains a Buffer or stream and metadata.
    res.setHeader('Content-Type', result.contentType || 'application/octet-stream');
    return res.status(200).send(result.data);
  } catch (error) {
    console.error('Error fetching media:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @route POST /media
 * @desc Upload a new media file.
 *       Expects a multipart/form-data request with a field named 'file'.
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const metadata = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };
    const saved = await createMedia(req.file.buffer, metadata);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Error creating media:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @route DELETE /media/:id
 * @desc Remove a media resource.
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteMedia(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    return res.status(200).json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
