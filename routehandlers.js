// Utility functions imported from local utils.js
import { getCurrentTimestamp, padToTwoDigits, validateFilename, parseDateFromFilename } from './utils.js';
import dotenv from 'dotenv';    // Loads environment variables from .env file
import fs from 'fs/promises';   // Modern promise-based filesystem operations
import fsSync from 'fs';        // Synchronous fs for createWriteStream
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
export const getSignal = async (req, res, csv = false) => {
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
    // Check that file exists
    await fs.access(filePath, fs.constants.F_OK);

    if (csv) {
      // Read file and convert to CSV
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .filter(line => line.trim() !== '' && !line.trim().startsWith('#')) // ignore comments and empty lines
        .map(line => line.trim().replace(/\s+/g, ',')); // replace spaces with commas

      // Add CSV header
      const csvData = ['Time (ns),Signal (mV)', ...lines].join('\n');
      const csvName = baseName.replace('.txt', '.csv');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvName}"`);
      res.send(csvData);
    } else {
      // Serve the original TXT file
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
      res.sendFile(filePath);
    }
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
    let fileContent = await fs.readFile(filePath, 'utf8');

    // Replace invalid JSON values before parsing
    fileContent = fileContent
      .replace(/\bNaN\b/g, 'null')
      .replace(/\bInfinity\b/g, 'null')
      .replace(/\b-Infinity\b/g, 'null');

    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('Invalid JSON format');
    }

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
    let { imageName, detector } = req.params;
    imageName = imageName.replace(subdir, 'data');
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
    // Read configuration file
    let configPath = path.join(ANALYSIS_DIR, 'configurations', 'configuration.json');
    let data = await fs.readFile(configPath, 'utf8');
    let configData = JSON.parse(data);
    // Read positron configuration
    configPath = path.join(ANALYSIS_DIR, 'configurations', 'default_config_positrons.json');
    data = await fs.readFile(configPath, 'utf8');
    const configPos = JSON.parse(data);
    // Read antiproton configuration
    configPath = path.join(ANALYSIS_DIR, 'configurations', 'default_config_antiprotons.json');
    data = await fs.readFile(configPath, 'utf8');
    const configPbar = JSON.parse(data);
    // Send the configuration data
    res.json({ configData, configPos, configPbar });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getConfiguration:', error.message);
    res.status(500).json({ error: 'Unable to read configuration file' });
  }
}

// Route handler to get the latest dump timestamp
export const getLatest = async (req, res) => {
  try {
    // Read the latest dump timestamp
    const latestPath = path.join(ANALYSIS_DIR, 'configurations', 'latest.json');
    const data = await fs.readFile(latestPath, 'utf8');
    const latestData = JSON.parse(data);
    res.json(latestData);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getLatest:', error.message);
    res.status(500).json({ error: 'Unable to read latest dump timestamp' });
  }
};

// Route handler to post/update configuration
export const postConfiguration = async (req, res) => {
  try {
    const configDir = path.join(ANALYSIS_DIR, 'configurations');
    const newConfig = req.body;

    await fs.writeFile(path.join(configDir, 'configuration.json'), JSON.stringify(newConfig, null, 2), 'utf8');

    // Propagate pitaya enable/disable states to both default config files
    const pitayaKeys = Object.keys(newConfig).filter(k => k.startsWith('red_pitaya_'));
    for (const defaultFile of ['default_config_positrons.json', 'default_config_antiprotons.json']) {
      const filePath = path.join(configDir, defaultFile);
      const raw = await fs.readFile(filePath, 'utf8');
      const defaultConfig = JSON.parse(raw);
      for (const key of pitayaKeys) defaultConfig[key] = newConfig[key];
      await fs.writeFile(filePath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    }

    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in postConfiguration:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Route handler to get the latest temperature data
export const getTemperature = async (req, res) => {
  try {
    const tempPath = path.join(ANALYSIS_DIR, 'configurations', 'latest_temperatures.json');
    const data = await fs.readFile(tempPath, 'utf8');
    const tempData = JSON.parse(data);
    res.json(tempData);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getTemperature:', error.message);
    res.status(500).json({ error: 'Unable to read temperature data' });
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
      path.join(ANALYSIS_DIR, 'commandLine.py'),
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

// Route handler to generate skimmer plot for a specific detector
export const skimmerPlot = async (req, res) => {
  try {
    const { detector } = req.params;
    const { jsonFiles } = req.body;

    if (!Array.isArray(jsonFiles) || jsonFiles.length === 0 || jsonFiles.some(file => typeof file !== 'string')) {
      const validationError = new Error('Invalid jsonFiles format. Expected a non-empty array of strings.');
      validationError.statusCode = 400;
      throw validationError;
    }
    jsonFiles.forEach(validateFilename);

    await new Promise((resolve, reject) => {
      const pythonProcess = spawn(PYTHON_PATH, [
        path.join(ANALYSIS_DIR, 'commandLine.py'),
        '--skimmer',
        '--dir', MAIN_DIR,
        '--detector', detector,
        '--jsonFiles', jsonFiles.join(','),
        '--verbose'
      ]);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`[stdout] ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`[stderr] ${data}`);
      });

      pythonProcess.on('error', (spawnError) => {
        reject(spawnError);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        if (code !== 0) {
          const processError = new Error(`Skimmer plot generation failed with exit code ${code}`);
          processError.statusCode = 500;
          return reject(processError);
        }
        resolve();
      });
    });

    const imageName = `skimmer_${detector}_${jsonFiles[0].replace('.json', '')}_${jsonFiles[jsonFiles.length - 1].replace('.json', '')}.png`;
    const { year, month, day } = parseDateFromFilename(jsonFiles[0]);
    const imagePath = path.join(MAIN_DIR, year, padToTwoDigits(month), padToTwoDigits(day), 'Skimmer', imageName);
    const imageBuffer = await fs.readFile(imagePath);

    return res.json({
      success: true,
      message: `Skimmer plot generated successfully for detector ${detector}.`,
      image: imageBuffer.toString('base64'),
      imageName,
      mimeType: 'image/png'
    });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in skimmerPlot:', error.message);
    const statusCode = error.statusCode || (error.code === 'ENOENT' ? 500 : 400);
    const message = error.code === 'ENOENT'
      ? 'Skimmer plot image not found after successful script execution.'
      : error.message;

    return res.status(statusCode).json({
      success: false,
      message,
      image: null
    });
  }
};

// Function to check if a Python worker process is running based on a PID file
export const isPythonRunning = async (pidfile) => {
  // Validate pidfile to prevent path traversal and disallow path separators
  if (typeof pidfile !== 'string' || !/^[A-Za-z0-9_-]+$/.test(pidfile)) {
    return false;
  }
  const PID_FILE = path.join(ANALYSIS_DIR, pidfile + ".pid");
  // Check if the PID file exists
  try {
    await fs.access(PID_FILE);
  } catch {
    return false;
  }

  // Read and parse the PID
  let pid;
  try {
    const content = await fs.readFile(PID_FILE, "utf8");
    pid = parseInt(content.trim(), 10);
    if (Number.isNaN(pid)) return false;
  } catch (e) {
    return false;
  }

  // Check if the process exists
  try {
    process.kill(pid, 0); // does not kill the process, only checks
    return true;
  } catch (e) {
    return false;
  }
};

/** In-memory map of running child processes keyed by script name. */
const runningProcesses = new Map();

/** Allowed script names mapped to their Python filenames, PID files, and log files. */
const SCRIPT_MAP = {
  temperature:  { script: 'temperature.py',        pidFile: 'temperature.pid', logFile: 'temperature.log' },
  acquisition:  { script: 'START_ACQUISITION.py',   pidFile: 'acquisition.pid', logFile: 'acquisition.log' },
  analysis:     { script: 'ONLINE_ANALYSIS.py',     pidFile: 'analysis.pid',    logFile: 'analysis.log' },
};

/**
 * Starts a Python script in the background and saves its PID to a file.
 * Only scripts listed in SCRIPT_MAP are allowed.
 *
 * @param {import('express').Request}  req - Express request (req.params.name = script key).
 * @param {import('express').Response} res - Express response.
 */
export const startPythonScript = async (req, res) => {
  try {
    const { name } = req.params;

    const entry = SCRIPT_MAP[name];
    if (!entry) {
      return res.status(400).json({ error: `Unknown script "${name}". Allowed: ${Object.keys(SCRIPT_MAP).join(', ')}` });
    }

    // Check if the script is already running
    const alreadyRunning = await isPythonRunning(name);
    if (alreadyRunning) {
      return res.status(409).json({ error: `${name} is already running` });
    }

    const scriptPath = path.join(ANALYSIS_DIR, entry.script);
    const pidFilePath = path.join(ANALYSIS_DIR, entry.pidFile);
    const logFilePath = path.join(ANALYSIS_DIR, entry.logFile);

    // Open a write stream for logging stdout and stderr
    const logStream = fsSync.createWriteStream(logFilePath, { flags: 'w' });

    // Spawn the Python process detached so it survives if the server restarts
    // stdin is 'pipe' (not 'ignore') so scripts with interactive prompts
    // (e.g. "press q to stop") block on input() instead of crashing with EOFError.
    const child = spawn(PYTHON_PATH, ['-u', scriptPath], {
      cwd: ANALYSIS_DIR,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Pipe stdout and stderr to the log file
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    // Store the child process reference so we can interact with its stdin later
    runningProcesses.set(name, child);

    // Clean up the map entry when the process exits
    child.on('close', () => {
      runningProcesses.delete(name);
    });

    // Allow the parent (Node) to exit independently of the child
    child.unref();

    // Save the PID to disk
    await fs.writeFile(pidFilePath, String(child.pid), 'utf8');

    console.log(`[startPythonScript] Started ${entry.script} (PID ${child.pid})`);
    res.json({ success: true, script: entry.script, pid: child.pid });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in startPythonScript:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stops a running Python script by sending SIGTERM and removes its PID file.
 * Only scripts listed in SCRIPT_MAP are allowed.
 *
 * @param {import('express').Request}  req - Express request (req.params.name = script key).
 * @param {import('express').Response} res - Express response.
 */
export const stopPythonScript = async (req, res) => {
  try {
    const { name } = req.params;

    const entry = SCRIPT_MAP[name];
    if (!entry) {
      return res.status(400).json({ error: `Unknown script "${name}". Allowed: ${Object.keys(SCRIPT_MAP).join(', ')}` });
    }

    // Check if the script is actually running
    const running = await isPythonRunning(name);
    if (!running) {
      return res.json({ success: true, message: `${name} is not running` });
    }

    const pidFilePath = path.join(ANALYSIS_DIR, entry.pidFile);

    // Read the PID from the file
    const content = await fs.readFile(pidFilePath, 'utf8');
    const pid = parseInt(content.trim(), 10);

    // For acquisition, gracefully stop by writing 'q' to stdin
    const child = runningProcesses.get(name);
    if (name === 'acquisition' && child && child.stdin && !child.stdin.destroyed) {
      child.stdin.write('q\n');
      child.stdin.end();
    } else {
      // Fallback: send SIGTERM
      process.kill(pid, 'SIGTERM');
    }

    // Remove the PID file
    await fs.unlink(pidFilePath);
    runningProcesses.delete(name);

    console.log(`[stopPythonScript] Stopped ${entry.script} (PID ${pid})`);
    res.json({ success: true, script: entry.script, pid });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in stopPythonScript:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ====================
// Pitaya status (cached ping)
// ====================

/** Cached pitaya status result and timestamp. */
let pitayaCache = { data: null, updatedAt: 0, pending: null };
const PITAYA_CACHE_TTL = 2000; // ms – re-ping at most every 2 s

/**
 * Pings all enabled Red Pitaya hosts in parallel and returns their statuses.
 * Results are cached for PITAYA_CACHE_TTL ms so rapid polling from the
 * frontend does not spawn hundreds of ping processes.
 */
export const getPitayaStatus = async (_req, res) => {
  try {
    const now = Date.now();

    // Return cached result if still fresh
    if (pitayaCache.data && now - pitayaCache.updatedAt < PITAYA_CACHE_TTL) {
      return res.json(pitayaCache.data);
    }

    // If a refresh is already in-flight, wait for it instead of spawning dupes
    if (pitayaCache.pending) {
      const result = await pitayaCache.pending;
      return res.json(result);
    }

    // Start a new refresh
    pitayaCache.pending = (async () => {
      try {
        // Read the configuration to discover hostnames
        const configPath = path.join(ANALYSIS_DIR, 'configurations', 'configuration.json');
        const raw = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(raw);
        const hostnames = config.hostnames || {};

        // Ping every enabled host in parallel
        const entries = await Promise.all(
          Object.entries(hostnames).map(([name, host]) => {
            const enabled = config[name] !== undefined ? config[name] : false;
            if (!enabled) {
              return { name, host, status: 'disabled' };
            }
            return new Promise((resolve) => {
              const ping = spawn('ping', ['-c', '1', '-W', '2', host]);
              ping.on('close', (code) => {
                resolve({ name, host, status: code === 0 ? 'on' : 'off' });
              });
              ping.on('error', () => {
                resolve({ name, host, status: 'off' });
              });
            });
          })
        );

        const result = { pitayas: entries, updatedAt: new Date().toISOString() };
        pitayaCache.data = result;
        pitayaCache.updatedAt = Date.now();
        return result;
      } finally {
        // Always clear pending so future requests can trigger a new refresh
        pitayaCache.pending = null;
      }
    })();

    const result = await pitayaCache.pending;
    res.json(result);
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getPitayaStatus:', error.message);
    res.status(500).json({ error: 'Unable to check pitaya status' });
  }
};

/**
 * Returns the log contents for a given script.
 * Supports an optional `lines` query parameter to return only the last N lines.
 *
 * @param {import('express').Request}  req - Express request (req.params.name = script key).
 * @param {import('express').Response} res - Express response.
 */
export const getScriptLogs = async (req, res) => {
  try {
    const { name } = req.params;

    const entry = SCRIPT_MAP[name];
    if (!entry) {
      return res.status(400).json({ error: `Unknown script "${name}". Allowed: ${Object.keys(SCRIPT_MAP).join(', ')}` });
    }

    const logFilePath = path.join(ANALYSIS_DIR, entry.logFile);

    let content;
    try {
      content = await fs.readFile(logFilePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.json({ name, log: '', lines: 0 });
      }
      throw error;
    }

    // If ?lines=N is specified, return only the last N lines
    const linesParam = parseInt(req.query.lines, 10);
    if (!Number.isNaN(linesParam) && linesParam > 0) {
      const allLines = content.split('\n');
      content = allLines.slice(-linesParam).join('\n');
    }

    res.json({ name, log: content });
  } catch (error) {
    console.error(getCurrentTimestamp());
    console.error('Error in getScriptLogs:', error.message);
    res.status(500).json({ error: error.message });
  }
};
