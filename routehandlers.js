// Utility functions imported from local utils.js
import { getCurrentTimestamp, padToTwoDigits, validateFilename, parseDateFromFilename } from './utils.js';
import dotenv from 'dotenv';    // Loads environment variables from .env file
import fs from 'fs/promises';   // Modern promise-based filesystem operations
import path from 'path';        // Cross-platform path handling
import { spawn } from 'child_process';


// Load environment variables and set base directory
dotenv.config();
export const MAIN_DIR = process.env.MAIN_DIR || '/home/alpha/Desktop/eos'; // Base directory for all data files
export const ANALYSIS_DIR = process.env.ANALYSIS_DIR || '/home/alpha/Desktop/burrito/software'; // Directory for analysis files
export const PYTHON_PATH = process.env.PYTHON_PATH || 'python3'; // Path to Python executable, default to 'python3'

// ====================
// Route handler
// ====================

// Route handler to get list of JSON files for a specific year/month/day
export const getJsonFiles = async (req, res) => {
  try {
    const { year, month, day } = req.params;
    const dirPath = path.join(MAIN_DIR, `${year}/${padToTwoDigits(month)}/${padToTwoDigits(day)}/JSON`);

    // Create directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getJsonFiles:', error.message);
    res.status(500).json({ error: 'Unable to read directory' });
  }
};

// Route handler to get signal file for a specific JSON file and detector
export const getSignal = async (req, res) => {
  try {
    const { jsonFilename, detector } = req.params;
    validateFilename(jsonFilename);

    const { year, month, day } = parseDateFromFilename(jsonFilename);
    const baseName = jsonFilename.replace('.json', '.txt');
    const filePath = path.join(
      MAIN_DIR,
      year,
      padToTwoDigits(month),
      padToTwoDigits(day),
      detector,
      baseName
    );

    await fs.access(filePath, fs.constants.F_OK);
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getSignal:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Signal file not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Route handler to get contents of a specific JSON file
export const getJsonContent = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    validateFilename(jsonFilename);
    const { year, month, day } = parseDateFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON', jsonFilename);
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getJsonContent:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Route handler to serve image files
export const getImage = async (req, res, subdir = 'Together') => {
  try {
    const { imageName, detector } = req.params;
    const jsonFilename = imageName.replace('.png', '.json');
    validateFilename(jsonFilename);

    const { year, month, day } = parseDateFromFilename(jsonFilename);
    const imagePath = path.join(
      MAIN_DIR,
      year,
      padToTwoDigits(month),
      padToTwoDigits(day),
      detector || subdir,
      imageName
    );

    await fs.access(imagePath, fs.constants.F_OK);
    res.sendFile(imagePath);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getImage:', error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Route handler to get comments from a JSON file
export const getComments = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    validateFilename(jsonFilename);
    const { year, month, day } = parseDateFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON', 'comments.json');

    let jsonData = {};
    try {
      const data = await fs.readFile(filePath, 'utf8');
      jsonData = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create directory and empty comments file
        const dirPath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON');
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify({}), 'utf8');
      } else {
        throw error;
      }
    }

    res.json({ comment: jsonData[jsonFilename] || null });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getComments:', error.message);
    res.json({ comment: null });
  }
};

// Route handler to post/update comments for a JSON file
export const postComments = async (req, res) => {
  try {
    const { jsonFilename } = req.params;
    const { comment } = req.body;

    validateFilename(jsonFilename);

    const { year, month, day } = parseDateFromFilename(jsonFilename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON', 'comments.json');

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

    // Ensure directory exists
    const dirPath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON');
    await fs.mkdir(dirPath, { recursive: true });

    // Write updated comments back to file
    await fs.writeFile(filePath, JSON.stringify(commentsData, null, 2), 'utf8');

    res.json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in postComments:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Route handler to get configuration data
export const getConfiguration = async (req, res) => {
  try {
    const configPath = path.join(ANALYSIS_DIR, 'configuration.json');
    const data = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(data);
    res.json(configData);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getConfiguration:', error.message);
    res.status(500).json({ error: 'Unable to read configuration file' });
  }
}

// Route handler to post/update configuration
export const postConfiguration = async (req, res) => {
  try {
    const configPath = path.join(ANALYSIS_DIR, 'configuration.json');
    const newConfig = req.body;
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in postConfiguration:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Route handler to re-analyse from a specific JSON file
export const reAnalyse = async (req, res) => {
  try {
    const { filename } = req.params;
    validateFilename(filename);

    const { year, month, day } = parseDateFromFilename(filename);
    const filePath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'JSON', filename);

    const pythonProcess = spawn(PYTHON_PATH, [
      path.join(ANALYSIS_DIR,'commandLine.py'),
      '--json', filename,
      '--dir', MAIN_DIR,
      '--verbose'
    ]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[stdout] ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[stderr] ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code !== 0) {
        return res.status(500).json({ error: `Re-analysis process failed with exit code ${code}` });
      }
      return res.json({ success: true });
    });

  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in reAnalyse:', error.message);
    return res.status(400).json({ error: error.message });
  }
};