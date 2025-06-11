// ALPHA Burritos API Server
// Author: Samuel Niang
//
// Main entry point for the ALPHA Burritos API server.
// Sets up Express application, middleware, API routes, error handling, and server startup.

import express from 'express';      // Express.js web framework
import cors from 'cors';            // Middleware for enabling CORS
import dotenv from 'dotenv';        // Loads environment variables from .env file
import { getCurrentTimestamp } from './utils.js';
import {
    getJsonFiles,
    getSignal,
    getJsonContent,
    getImage,
    getComments,
    postComments,
    MAIN_DIR
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

// ====================
// Middleware
// ====================

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ====================
// API Routes
// ====================

// Health check endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Retrieve list of JSON files for a given year and month
app.get('/api/:year/:month/json', getJsonFiles);

// Retrieve content of a specific JSON file
app.get('/api/json/:jsonFilename', getJsonContent);

// Retrieve combined image for a JSON file
app.get('/api/img_all/:jsonFilename', (req, res) => getImage(req, res));

// Retrieve detector-specific image for a JSON file
app.get('/api/img/:detector/:jsonFilename', (req, res) => getImage(req, res, req.params.detector));

// Retrieve signal data as a text file for a detector and JSON file
app.get('/api/signal/:detector/:jsonFilename', (req, res) => getSignal(req, res));

// Retrieve comments for a specific JSON file
app.get('/api/comments/:jsonFilename', (req, res) => getComments(req, res));

// Post comments for a specific JSON file
app.post('/api/comments/:jsonFilename', (req, res) => postComments(req, res));

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
