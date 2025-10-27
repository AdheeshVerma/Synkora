import MediaService from '../services/mediaService.js';

/**
 * Create a new media entry.
 * Expects a file object attached to the request (e.g., via Multer).
 */
export const createMedia = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const media = await MediaService.create(file);
    return res.status(201).json(media);
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieve a single media item by its identifier.
 */
export const getMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await MediaService.getById(id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    return res.status(200).json(media);
  } catch (err) {
    return next(err);
  }
};

/**
 * List media items with optional pagination.
 * Query parameters: page (default 1), limit (default 20).
 */
export const listMedia = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await MediaService.list({ page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete a media item by its identifier.
 */
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await MediaService.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Media not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};