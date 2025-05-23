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

app.use(cors());

app.get('/api/json-files', (req, res) => {
  const dirPath = path.join('/Users/samuelniang/cern_burritos/2025/05/JSON');
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});