// ALPHA Burritos API
// @author: Samuel Niang
//
import express from 'express';  // Express.js web framework
import cors from 'cors';        // Cross-Origin Resource Sharing middleware
import dotenv from 'dotenv';    // Load environment variables from .env file
import { getCurrentTimestamp } from './utils.js'; 
import { getJsonFiles, getSignal, getJsonContent, getImage, getComments, postComments } from './routehandlers.js';


// ====================
// Environment & Config
// ====================
dotenv.config();
// Set up constants and configuration
const app = express();                                // Create Express application
const PORT =  process.env.PORT || 3001;                                    // Set server port


// ====================
// Middleware
// ====================
app.use(cors());         // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies


// ====================
// API Routes
// ====================
app.get('/api/test', (req, res) => { res.json({ message: 'API is working' }); }); // Test the API
app.get('/api/:year/:month/json', getJsonFiles);          // Get JSON files list
app.get('/api/json/:jsonFilename', getJsonContent);           // Get JSON content
app.get('/api/img_all/:jsonFilename', (req, res) => getImage(req, res));  // Get combined image
app.get('/api/img/:detector/:jsonFilename', (req, res) => getImage(req, res, req.params.detector));  // Get detector-specific image
app.get('/api/signal/:detector/:jsonFilename', (req, res) => getSignal(req, res));  // Get signal as a text file
app.get('/api/comments/:jsonFilename', (req, res) => getComments(req, res)); // Get the comments
app.post('/api/comments/:jsonFilename', (req, res) => postComments(req, res)); // post the comments


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
app.listen(PORT, '0.0.0.0', () => {
  console.log(getCurrentTimestamp())
  console.log('Server started');
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Main directory is set to: ${process.env.MAIN_DIR}`);
});
