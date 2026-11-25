import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface UploadedFileResult {
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageDriver: 'local' | 's3';
  storagePath: string;
}

export class StorageService {
  private localDir: string;

  constructor() {
    this.localDir = path.resolve(process.cwd(), env.STORAGE_LOCAL_DIR);
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file buffer to private storage
   */
  async saveBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileResult> {
    if (buffer.length > env.STORAGE_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(`File exceeds maximum permitted size of ${env.STORAGE_MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
    }

    const ext = path.extname(originalName).toLowerCase();
    const allowedExtensions = ['.pdf', '.zip', '.tar.gz', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.csv', '.json', '.docx', '.xlsx'];
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestError(`File extension '${ext}' is not permitted for upload.`);
    }

    const fileKey = `${Date.now()}_${uuidv4()}${ext}`;
    const destinationPath = path.join(this.localDir, fileKey);

    await fs.promises.writeFile(destinationPath, buffer);
    logger.info('File saved to private storage', { fileKey, sizeBytes: buffer.length });

    return {
      fileKey,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      storageDriver: 'local',
      storagePath: destinationPath,
    };
  }

  /**
   * Retrieve file path for authorized download
   */
  async getLocalFilePath(fileKey: string): Promise<string> {
    const safeKey = path.basename(fileKey);
    const fullPath = path.join(this.localDir, safeKey);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundError('File not found in storage');
    }

    return fullPath;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileKey: string): Promise<void> {
    const safeKey = path.basename(fileKey);
    const fullPath = path.join(this.localDir, safeKey);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      logger.info('File deleted from storage', { fileKey });
    }
  }
}

export const storageService = new StorageService();
