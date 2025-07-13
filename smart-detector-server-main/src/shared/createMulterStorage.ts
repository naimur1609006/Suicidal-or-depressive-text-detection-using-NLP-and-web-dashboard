import fs from 'fs';
import mime from 'mime-types';
import multer from 'multer';
import path from 'path';

export const createMulterStorage = (folderName: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join('uploads', folderName);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const originalname = file.originalname;
      const filename = path.parse(originalname).name;
      // Get extension from mime type or original file
      const mimeExt = mime.extension(file.mimetype);
      const originalExt = path.parse(originalname).ext.slice(1);
      const ext = mimeExt || originalExt || 'bin';

      // Sanitize filename - remove special characters
      const sanitizedName = filename.replace(/[^a-zA-Z0-9]/g, '_');

      // Check if file already exists
      const checkAndGenerateName = (attempt = 0): string => {
        const newName =
          attempt === 0
            ? `${sanitizedName}.${ext}`
            : `${sanitizedName}_${attempt}.${ext}`;
        const fullPath = path.join('uploads', folderName, newName);

        if (!fs.existsSync(fullPath)) {
          return newName;
        }
        return checkAndGenerateName(attempt + 1);
      };

      cb(null, checkAndGenerateName());
    },
  });
};

const fileFilter = (req: any, file: any, cb: any) => {
  cb(null, true);
};

export const createUploadMiddleware = (
  folderName: string,
  options: {
    maxFileSize?: number;
    allowedTypes?: string[];
  } = {}
) => {
  const { maxFileSize = 1024 * 1024 * 100, allowedTypes } = options; // Default 100MB

  return multer({
    storage: createMulterStorage(folderName),
    limits: { fileSize: maxFileSize },
    fileFilter: allowedTypes
      ? (req, file, cb) => {
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(`Only ${allowedTypes.join(', ')} are allowed.`));
          }
        }
      : fileFilter,
  });
};

export const deleteFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const handleFileUpdate = async (
  // eslint-disable-next-line no-undef
  newFile: Express.Multer.File | undefined,
  oldFilePath: string | undefined
): Promise<string | null> => {
  if (newFile) {
    // Delete the old file
    if (oldFilePath && fs.existsSync(oldFilePath)) {
      deleteFile(oldFilePath);
    }
    return newFile.path;
  }
  return oldFilePath || null;
};
