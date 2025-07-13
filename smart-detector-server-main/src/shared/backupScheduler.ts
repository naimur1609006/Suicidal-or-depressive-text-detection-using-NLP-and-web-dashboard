import archiver from 'archiver';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import cron from 'node-cron';
import path from 'path';
import config from '../config';

const MONGO_URI = config.database_url as string;
const DATABASE_NAME = config.database_name as string;
const BACKUP_DIR = path.join(__dirname, '../../smart-detector-db-backup');

// Maximum number of backups to keep
const MAX_BACKUPS = 15;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Function to create a backup
async function createBackup() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Get all collections
    const collections = await db.collections();

    const timestamp = new Date().toISOString().slice(0, 10);
    const backupFilePath = path.join(BACKUP_DIR, `backup_${timestamp}.zip`);

    // Create a writable stream for the .zip file
    const output = fs.createWriteStream(backupFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    // Loop through collections and add each to the archive
    for (const collection of collections) {
      const data = await collection.find().toArray();
      const collectionFileName = `${collection.collectionName}.json`;

      // Append the data of each collection to the archive as a JSON file
      archive.append(JSON.stringify(data, null, 2), {
        name: collectionFileName,
      });
    }

    // Finalize the archive (this will start writing the file)
    await archive.finalize();

    // Rotate backups to ensure only the last 15 backups are kept
    rotateBackups();
  } catch (error) {
    // console.error('Error creating backup:', error);
  } finally {
    await client.close();
  }
}

// Function to rotate backups and ensure only the last 15 backups are kept
function rotateBackups() {
  // Read the backup directory
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err);
      return;
    }

    // Filter files that start with the backup name (e.g., 'backup_')
    const backups = files
      .filter(file => file.startsWith('backup_'))
      .sort() // Sort files by name, which will naturally sort by date (since the date is part of the filename)
      .reverse(); // Reverse to get the most recent backups first

    // If there are more than MAX_BACKUPS, delete the oldest backups
    if (backups.length > MAX_BACKUPS) {
      const backupsToDelete = backups.slice(MAX_BACKUPS);

      backupsToDelete.forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        fs.unlink(filePath, err => {
          if (err) {
            // console.error(`Error deleting old backup: ${filePath}`);
          } else {
            // console.log(`Deleted old backup: ${filePath}`);
          }
        });
      });
    }
  });
}

// Schedule the backup using cron: every day at midnight (00:00)
cron.schedule('0 0 * * *', () => {
  createBackup();
});
