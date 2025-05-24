// Import required modules
import express from 'express';  // Express.js web framework
import cors from 'cors';        // Cross-Origin Resource Sharing middleware
import fs from 'fs/promises';   // File system module with promises support
import path from 'path';        // Path manipulation utility
import { fileURLToPath } from 'url';  // URL manipulation utility

// Set up constants and configuration
const __filename = fileURLToPath(import.meta.url);  // Get current file path
const __dirname = path.dirname(__filename);         // Get current directory path
const app = express();                             // Create Express application
const PORT = process.env.PORT || 3001;             // Set server port
const MAIN_DIR = '/Users/samuelniang/cern_burritos';  // Base directory for data

// Configure middleware
app.use(cors());         // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Utility function to ensure numbers are two digits (e.g., '1' -> '01')
const padToTwoDigits = (number) => String(number).padStart(2, "0");

// Parse year and month from a filename (format: xxx-YYYY-MM-xxx.json)
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

// Validate filename to prevent directory traversal attacks
const validateFilename = (filename) => {
  if (!filename.endsWith('.json') || filename.includes('..')) {
    throw new Error('Invalid file name');
  }
};

// Route handler to get list of JSON files for a specific year/month
const getJsonFiles = async (req, res) => {
  try {
    const { year, month } = req.params;
    const dirPath = path.join(MAIN_DIR, `${year}/${padToTwoDigits(month)}/JSON`);
    console.log(`Reading directory: ${dirPath}`);
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files`);
    res.json(jsonFiles);
  } catch (error) {
    console.error('Error in getJsonFiles:', error.message);
    res.status(500).json({ error: 'Unable to read directory' });
  }
};

// Route handler to get contents of a specific JSON file
const getJsonContent = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log(`Getting content for file: ${filename}`);
    validateFilename(filename);
    const { year, month } = parseYearMonthFromFilename(filename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), 'JSON', filename);
    console.log(`Reading file from: ${filePath}`);
    
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log('Successfully parsed JSON data');
    res.json(jsonData);
  } catch (error) {
    console.error('Error in getJsonContent:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Route handler to serve image files
const getImage = async (req, res, subdir = 'Together') => {
  try {
    const { jsonFilename, detector } = req.params;
    console.log(`Getting image for JSON file: ${jsonFilename}, detector: ${detector || subdir}`);
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
    console.log(`Looking for image at: ${imagePath}`);

    await fs.access(imagePath, fs.constants.F_OK);
    console.log('Image found, sending file');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error in getImage:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Define API routes
app.get('/api/:year/:month/json', getJsonFiles);          // Get JSON files list
app.get('/api/json/:filename', getJsonContent);           // Get JSON content
app.get('/api/img_all/:jsonFilename', (req, res) => getImage(req, res));  // Get combined image
app.get('/api/img/:detector/:jsonFilename', (req, res) => getImage(req, res, req.params.detector));  // Get detector-specific image

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
