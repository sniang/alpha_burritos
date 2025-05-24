import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const mainDir = '/Users/samuelniang/cern_burritos';

const padToTwoDigits = (number) => {
  return String(number).padStart(2, "0");
};

const parseYearMonthFromFilename = (filename) => {
  const parts = filename.split("-");
  if (parts.length < 3) {
    throw new Error("Invalid filename format: year and month not found.");
  }
  const year = parts[1];
  const month = parts[2];
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    throw new Error("Invalid year or month format.");
  }
  return { year, month };
};

app.use(cors());

app.get('/api/:year/:month/json', (req, res) => {
  const { year, month } = req.params;
  const dirPath = path.join(mainDir, `${year}/${padToTwoDigits(month)}/JSON`);
  console.log(dirPath);
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  });
});

app.get('/api/json/:filename', (req, res) => {
  const { filename } = req.params;

  // Prevent path traversal attacks
  if (!filename.endsWith('.json') || filename.includes('..')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  let filePath;
  try {
    const { year, month } = parseYearMonthFromFilename(filename);
    console.log(year, month);
    filePath = path.join(mainDir, year, padToTwoDigits(month), 'JSON', filename);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid file name format' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.get('/api/img_all/:jsonFilename', (req, res) => {
  const { jsonFilename } = req.params;

  // Basic validation and sanitisation
  if (!jsonFilename.endsWith('.json') || jsonFilename.includes('..')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  const baseName = jsonFilename.replace('.json', '.png');
  let imagePath;
  try {
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    console.log(year, month);
    imagePath = path.join(mainDir, year, padToTwoDigits(month), 'Together', baseName);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid file name format' });
  }

  // Check if the file exists and send it
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(imagePath);
  });
});

app.get('/api/img/:detector/:jsonFilename', (req, res) => {
  const { detector, jsonFilename } = req.params;

  // Basic validation and sanitisation
  if (!jsonFilename.endsWith('.json') || jsonFilename.includes('..')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  const baseName = jsonFilename.replace('.json', '.png');
  let imagePath;
  try {
    const { year, month } = parseYearMonthFromFilename(jsonFilename);
    console.log(year, month);
    imagePath = path.join(mainDir, year, padToTwoDigits(month), detector, baseName);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid file name format' });
  }


  console.log(imagePath);

  // Check if the file exists and send it
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(imagePath);
  });
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});