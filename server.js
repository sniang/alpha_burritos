// Import required modules
import express from 'express';  // Express.js web framework
import cors from 'cors';        // Cross-Origin Resource Sharing middleware
import fs from 'fs/promises';   // File system module with promises support
import path from 'path';        // Path manipulation utility

// Set up constants and configuration
const app = express();                                // Create Express application
const PORT = 3001;                                    // Set server port
const MAIN_DIR = '/home/alpha/Desktop/eos'            // Base directory for data
//const MAIN_DIR = '/Users/samuelniang/cernbox/test'

// Configure middleware
app.use(cors());         // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Utility function to ensure numbers are two digits (e.g., '1' -> '01')
const padToTwoDigits = (number) => String(number).padStart(2, "0");

// Parse year and month from a filename (format: xxx-YYYY-MM-xxx.json)
const parseYearMonthFromFilename = (jsonFilename) => {
  const parts = jsonFilename.split("-");
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
const validateFilename = (jsonFilename) => {
  if (!jsonFilename.endsWith('.json') || jsonFilename.includes('..')) {
    throw new Error('Invalid file name');
  }
};

// Route handler to get list of JSON files for a specific year/month
const getJsonFiles = async (req, res) => {
  try {
    const { year, month } = req.params;
    const dirPath = path.join(MAIN_DIR, `${year}/${padToTwoDigits(month)}/JSON`);
    console.log(`Reading directory: ${dirPath}`);
    
    // Create directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });
    
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files`);
    res.json(jsonFiles);
  } catch (error) {
    console.error('Error in getJsonFiles:', error.message);
    res.status(500).json({ error: 'Unable to read directory' });
  }
};

// Route handler to get signal file for a specific JSON file and detector
const getSignal = async (req, res) => {
  try {
    const { jsonFilename, detector } = req.params;
    console.log(`Getting signal file for JSON file: ${jsonFilename}, detector: ${detector}`);
    validateFilename(jsonFilename);

    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    const baseName = jsonFilename.replace('.json', '.txt');
    const filePath = path.join(
      MAIN_DIR,
      year,
      padToTwoDigits(month),
      detector,
      baseName
    );
    console.log(`Looking for signal file at: ${filePath}`);

    await fs.access(filePath, fs.constants.F_OK);
    console.log('Signal file found, sending file');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error in getSignal:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Signal file not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Route handler to get contents of a specific JSON file
const getJsonContent = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    console.log(`Getting content for file: ${jsonFilename}`);
    validateFilename(jsonFilename);
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), 'JSON', jsonFilename);
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

// Route handler to get comments from a JSON file
const getComments = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    console.log(`Getting comments for file: ${jsonFilename}`);
    validateFilename(jsonFilename);
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), 'comments.json');
    console.log(`Reading comments from: ${filePath}`);
    
    let jsonData = {};
    try {
      const data = await fs.readFile(filePath, 'utf8');
      jsonData = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create directory and empty comments file
        const dirPath = path.join(MAIN_DIR, year, padToTwoDigits(month));
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify({}), 'utf8');
        console.log(`Created new comments file at: ${filePath}`);
      } else {
        throw error;
      }
    }
    
    console.log(`Comments found: ${jsonData[jsonFilename] ? 'Yes' : 'No'}`);
    res.json({comment: jsonData[jsonFilename] || null});    
  } catch (error) {
    console.error('Error in getComments:', error.message);
    res.json({ comment: null });
  }
};

// Route handler to post/update comments for a JSON file
const postComments = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    const { comment } = req.body;
    
    validateFilename(jsonFilename);
    
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), 'comments.json');
    
    // Read existing comments file or create empty object if it doesn't exist
    let commentsData = {};
    try {
      const data = await fs.readFile(filePath, 'utf8');
      commentsData = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, will create a new one
    }
    
    // Update the comment for this file
    commentsData[jsonFilename] = comment;
    console.log(`Updating comment for ${jsonFilename}: ${comment}`);
    
    // Ensure directory exists
    const dirPath = path.join(MAIN_DIR, year, padToTwoDigits(month));
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write updated comments back to file
    await fs.writeFile(filePath, JSON.stringify(commentsData, null, 2), 'utf8');
    
    console.log(`Comment updated successfully for ${jsonFilename}`);
    res.json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error in postComments:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Define API routes
app.get('/api/test', (req, res) => { res.json({ message: 'API is working' }); }); // Test the API
app.get('/api/:year/:month/json', getJsonFiles);          // Get JSON files list
app.get('/api/json/:jsonFilename', getJsonContent);           // Get JSON content
app.get('/api/img_all/:jsonFilename', (req, res) => getImage(req, res));  // Get combined image
app.get('/api/img/:detector/:jsonFilename', (req, res) => getImage(req, res, req.params.detector));  // Get detector-specific image
app.get('/api/signal/:detector/:jsonFilename', (req, res) => getSignal(req, res));  // Get signal as a text file
app.get('/api/comments/:jsonFilename', (req, res) => getComments(req, res)); // Get the comments
app.post('/api/comments/:jsonFilename', (req, res) => postComments(req, res)); // post the comments

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
