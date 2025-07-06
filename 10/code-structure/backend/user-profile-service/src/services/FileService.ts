import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private uploadPath: string;
  private maxFileSize: number;
  private allowedTypes: string[];

  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
    this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',');
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    // Create subdirectories for organization
    const subDirs = ['avatars', 'temp'];
    subDirs.forEach(dir => {
      const dirPath = path.join(this.uploadPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, 'avatars', fileName);

    // Save file
    await fs.promises.writeFile(filePath, file.buffer);

    // Return relative URL
    return `/uploads/avatars/${fileName}`;
  }

  async deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl || !avatarUrl.startsWith('/uploads/')) {
      return; // Not a local file
    }

    const filePath = path.join(process.cwd(), avatarUrl);
    
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting avatar file:', error);
      // Don't throw error as this is not critical
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
    }

    // Check for potential security issues
    const fileName = file.originalname.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
    
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      throw new Error('File type not allowed for security reasons');
    }
  }

  getFileInfo(filePath: string): { exists: boolean; size?: number; mimeType?: string } {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          exists: true,
          size: stats.size,
          mimeType: this.getMimeType(filePath)
        };
      }
    } catch (error) {
      console.error('Error getting file info:', error);
    }
    
    return { exists: false };
  }

  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(this.uploadPath, 'temp');
    
    try {
      const files = await fs.promises.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.promises.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.promises.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

export default new FileService();
