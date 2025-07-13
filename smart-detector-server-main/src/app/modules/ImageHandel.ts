import express from 'express';
import fs from 'fs';
import path from 'path';
import { ENUM_USER_ROLES } from '../../enums/user';
import {
  createUploadMiddleware,
  deleteFile,
} from '../../shared/createMulterStorage';
import auth from '../middlewares/auth';
import originCheck from '../middlewares/originCheck';

const router = express.Router();

const uploadFolderName = 'Image_Uploads';

const uploadMiddleware = createUploadMiddleware(uploadFolderName);

// Endpoint to upload a file
router.post(
  '/upload',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  uploadMiddleware.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const originalName = req.file.originalname;
    const sanitizedFileName = originalName.replace(/\s+/g, '_');

    const newFileName = `${path.parse(sanitizedFileName).name}.png`;
    const newFilePath = path.join(req.file.destination, newFileName);

    fs.renameSync(req.file.path, newFilePath);

    res.status(201).json({
      message: 'File uploaded successfully.',
      file: { ...req.file, filename: newFileName }, // Return the new filename
    });
  }
);

// Endpoint to delete a file
router.delete(
  '/files/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  (req, res) => {
    const filePath = path.join(
      'uploads',
      uploadFolderName,
      `${req.params.id}.png`
    );
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }
    deleteFile(filePath);
    res.status(200).json({ message: 'File deleted successfully.' });
  }
);

// Endpoint to list files
router.get(
  '/files',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  (req, res) => {
    const dirPath = path.join('uploads', uploadFolderName);
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return res.status(500).json({ message: 'Unable to retrieve files.' });
      }

      const filePaths = files.map(file => ({
        name: file,
        path: `uploads/${uploadFolderName}/${file}`,
      }));

      res.json(filePaths);
    });
  }
);

export const ImageHandel = router;
