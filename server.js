// ALPHA Burritos API Server
// Author: Samuel Niang
//
// Main entry point for the ALPHA Burritos API server.
// Sets up Express application, middleware, API routes, error handling, and server startup.

import express from 'express';      // Express.js web framework
import cors from 'cors';            // Middleware for enabling CORS
import dotenv from 'dotenv';        // Loads environment variables from .env file
import cookieParser from 'cookie-parser';   // Middleware for parsing cookies
import jwt from 'jsonwebtoken'; // JSON Web Token library for authentication
import bcrypt from 'bcrypt'; // Library for hashing passwords

import { getCurrentTimestamp } from './utils.js';
import {
    getJsonFiles,
    getSignal,
    getJsonContent,
    getImage,
    getComments,
    postComments,
    getConfiguration,
    postConfiguration,
    getLatest,
    reAnalyse,
    MAIN_DIR,
} from './routehandlers.js';

// ====================
// Environment & Config
// ====================

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Set server port from environment or default to 3001
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const USER_LOGIN = process.env.USER_LOGIN;
const USER_PASSWORD_HASH = process.env.USER_PASSWORD_HASH;

// ====================
// Middleware
// ====================

// Enable CORS for all routes
app.use(cors({  credentials: true}));
// Parse incoming JSON request bodies
app.use(express.json());
// Parse cookies from incoming requests
app.use(cookieParser());

// ====================
// API Routes
// ====================

// Health check endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Retrieve list of JSON files for a given year and month
app.get('/api/:year/:month/:day/json', getJsonFiles);

// Retrieve content of a specific JSON file
app.get('/api/json/:jsonFilename', getJsonContent);

// Retrieve multiplot image 
app.get('/api/Together/:imageName', (req, res) => getImage(req, res));

// Retrieve the image containing a single plot for all signals
app.get('/api/Same/:imageName', (req, res) => getImage(req, res, 'Same'));

// Retrieve detector-specific image 
app.get('/api/img/:detector/:imageName', (req, res) => getImage(req, res, req.params.detector));

// Retrieve signal data as a text file for a detector and JSON file
app.get('/api/signal/:detector/:jsonFilename', (req, res) => getSignal(req, res));

// Retrieve signal data as a text file for a detector and JSON file
app.get('/api/signal/csv/:detector/:jsonFilename', (req, res) => getSignal(req, res, true));

// Retrieve comments for a specific JSON file
app.get('/api/comments/:jsonFilename', (req, res) => getComments(req, res));

// Post comments for a specific JSON file
app.post('/api/comments/:jsonFilename', (req, res) => postComments(req, res));

// Get the configuration for the analysis
app.get('/api/configuration', (req, res) => getConfiguration(req, res));

// Post the configuration for the analysis
app.post('/api/configuration', (req, res) => postConfiguration(req, res));

// Get the latest dump timestamp
app.get('/api/latest', (req, res) => getLatest(req, res));

// Re-analyse a specific JSON file
app.get('/api/reanalyse/:filename', (req, res) => reAnalyse(req, res));

// ====================
// Authentication Routes
// ====================
// Login route
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  if (login !== USER_LOGIN) {
    return res.status(401).json({ message: 'Invalid login' });
  }

  const isValid = await bcrypt.compare(password, USER_PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  const token = jwt.sign({ login }, JWT_SECRET, { expiresIn: '48h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // set to true in production (HTTPS)
    sameSite: 'Strict'
  });

  res.json({ message: 'Login successful' });
});
// Auth middleware
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
// Profile route to get user information
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({ login: req.user.login });
});
// Logout route
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict'
  });
  res.json({ message: 'Logout successful' });
});


// ====================
// Error Handling
// ====================

/**
 * Handles requests to undefined routes.
 * Responds with 404 Not Found.
 */
app.use((req, res) => {
    console.error(getCurrentTimestamp());
    console.error('404 Not Found:', req.originalUrl);
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found.'
    });
});

/**
 * Global error handler for uncaught errors.
 * Responds with 500 Internal Server Error.
 */
app.use((err, req, res, next) => {
    console.error(getCurrentTimestamp());
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
    });
});

// ====================
// Server Startup
// ====================

// Start the server and listen on the specified port
app.listen(PORT, '0.0.0.0', () => {
    console.log(getCurrentTimestamp());
    console.log('Server started');
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Main directory is set to: ${MAIN_DIR}`);
});
