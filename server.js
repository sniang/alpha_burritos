import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';  // Using promises-based fs
import path from 'path';
import { fileURLToPath } from 'url';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
const MAIN_DIR = '/Users/samuelniang/cern_burritos';

// Middleware
app.use(cors());
app.use(express.json());

// Utility functions
const padToTwoDigits = (number) => String(number).padStart(2, "0");

const parseYearMonthFromFilename = (filename) => {
  const parts = filename.split("-");
  if (parts.length < 3) {
    throw new Error("Invalid filename format: year and month not found.");
  }
  const [, year, month] = parts;
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    throw new Error("Invalid year or month format.");
  }
  return { year, month };
};

const validateFilename = (filename) => {
  if (!filename.endsWith('.json') || filename.includes('..')) {
    throw new Error('Invalid file name');
  }
};

// Route handlers
const getJsonFiles = async (req, res) => {
  try {
    const { year, month } = req.params;
    const dirPath = path.join(MAIN_DIR, `${year}/${padToTwoDigits(month)}/JSON`);
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  } catch (error) {
    res.status(500).json({ error: 'Unable to read directory' });
  }
};

const getJsonContent = async (req, res) => {
  try {
    const { filename } = req.params;
    validateFilename(filename);
    const { year, month } = parseYearMonthFromFilename(filename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), 'JSON', filename);
    
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const getImage = async (req, res, subdir = 'Together') => {
  try {
    const { jsonFilename, detector } = req.params;
    validateFilename(jsonFilename);
    
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    const baseName = jsonFilename.replace('.json', '.png');
    const imagePath = path.join(
      MAIN_DIR, 
      year, 
      padToTwoDigits(month), 
      detector || subdir, 
      baseName
    );

    await fs.access(imagePath, fs.constants.F_OK);
    res.sendFile(imagePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Routes
app.get('/api/:year/:month/json', getJsonFiles);
app.get('/api/json/:filename', getJsonContent);
app.get('/api/img_all/:jsonFilename', (req, res) => getImage(req, res));
app.get('/api/img/:detector/:jsonFilename', (req, res) => getImage(req, res, req.params.detector));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Server initialization
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
