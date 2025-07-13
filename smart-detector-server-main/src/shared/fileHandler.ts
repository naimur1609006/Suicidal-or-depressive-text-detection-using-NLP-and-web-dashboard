import { RequestHandler } from 'express';
import fs from 'fs';

type FileHandlerOptions = {
  field: string;
  maxCount?: number;
  existingFiles?: string[];
}

export const handleFileOperation = async (
  files: Express.Multer.File[],
  deletedFiles: string[] = [],
  existingFiles: string[] = []
): Promise<string[]> => {
  let updatedPaths = [...existingFiles];

  // Handle deleted files
  if (deletedFiles.length > 0) {
    // Delete files from server
    for (const filePath of deletedFiles) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
      }
    }
    // Remove deleted paths from the array
    updatedPaths = updatedPaths.filter(
      path => !deletedFiles.includes(path.replace(/\//g, '\\'))
    );
  }

  // Add new files
  if (files && files.length > 0) {
    updatedPaths.push(...files.map(file => file.path));
  }

  return updatedPaths;
};

export const parseDeletedFiles = (deletedFilesData: any): string[] => {
  try {
    return typeof deletedFilesData === 'string'
      ? JSON.parse(deletedFilesData)
      : Array.isArray(deletedFilesData)
      ? deletedFilesData
      : [];
  } catch (e) {
    return [];
  }
};

export const createFileHandler = (
  options: FileHandlerOptions
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      const deletedFiles = parseDeletedFiles(
        req.body[`deleted${options.field}`]
      );
      const existingFiles = options.existingFiles || [];

      const updatedFiles = await handleFileOperation(
        files,
        deletedFiles,
        existingFiles
      );

      // Add the result to the request object
      req.body[options.field] = updatedFiles;
      delete req.body[`deleted${options.field}`];

      next();
    } catch (error) {
      next(error);
    }
  };
};
