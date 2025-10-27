import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for storing uploaded media files
const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads');

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

/**
 * MediaService provides basic CRUD operations for media files stored on the local filesystem.
 * It maintains an in‑memory index of metadata for quick lookup. In a real‑world scenario this
 * index would be persisted in a database.
 */
class MediaService {
  constructor() {
    // In‑memory map: id -> metadata
    this.mediaIndex = new Map();
  }

  /**
   * Stores a media file.
   * @param {Object} file - Object representing the uploaded file.
   * @param {Buffer|string|Readable} file.content - File data.
   * @param {string} file.originalName - Original filename provided by the client.
   * @param {string} file.mimeType - MIME type of the file.
   * @returns {Promise<Object>} Metadata of the stored media.
   */
  async uploadMedia({ content, originalName, mimeType }) {
    if (!content) {
      throw new Error('File content is required');
    }
    const id = uuidv4();
    const ext = path.extname(originalName) || '';
    const safeName = `${id}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    // Write file to disk
    if (content instanceof Buffer) {
      await fs.writeFile(filePath, content);
    } else if (typeof content === 'string') {
      await fs.writeFile(filePath, content, 'utf8');
    } else if (content && typeof content.pipe === 'function') {
      // Assume a readable stream
      const writeStream = (await import('fs')).createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        content.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else {
      throw new Error('Unsupported content type');
    }

    const stats = await fs.stat(filePath);
    const metadata = {
      id,
      filename: safeName,
      originalName,
      mimeType: mimeType || 'application/octet-stream',
      size: stats.size,
      path: filePath,
      createdAt: new Date().toISOString()
    };
    this.mediaIndex.set(id, metadata);
    return metadata;
  }

  /**
   * Retrieves metadata for a given media ID.
   * @param {string} id - Media identifier.
   * @returns {Promise<Object>} Metadata object.
   */
  async getMediaMetadata(id) {
    const metadata = this.mediaIndex.get(id);
    if (!metadata) {
      throw new Error(`Media with id ${id} not found`);
    }
    return metadata;
  }

  /**
   * Streams the media file to the caller.
   * @param {string} id - Media identifier.
   * @returns {Promise<Readable>} Readable stream of the file.
   */
  async getMediaStream(id) {
    const metadata = await this.getMediaMetadata(id);
    const { createReadStream } = await import('fs');
    return createReadStream(metadata.path);
  }

  /**
   * Deletes a media file and its metadata.
   * @param {string} id - Media identifier.
   * @returns {Promise<void>}
   */
  async deleteMedia(id) {
    const metadata = await this.getMediaMetadata(id);
    await fs.unlink(metadata.path).catch(() => {});
    this.mediaIndex.delete(id);
  }

  /**
   * Lists stored media metadata with simple pagination.
   * @param {number} [page=1] - Page number (1‑based).
   * @param {number} [limit=20] - Items per page.
   * @returns {Promise<Object[]>} Array of metadata objects.
   */
  async listMedia(page = 1, limit = 20) {
    const all = Array.from(this.mediaIndex.values());
    const start = (page - 1) * limit;
    return all.slice(start, start + limit);
  }
}

const mediaService = new MediaService();
export default mediaService;
