require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();

// Standard middleware stack
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API endpoints routing
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/job', require('./routes/job'));
app.use('/api/pipeline', require('./routes/pipeline'));

// Environment status route for workspace health checklist
app.get('/api/status', (req, res) => {
  const isGeminiActive = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.startsWith('your_'));
  const isMongoActive = process.env.USE_IN_MEMORY_DB !== 'true';
  res.status(200).json({
    success: true,
    isGeminiActive,
    isMongoActive
  });
});

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Resume Analyzer & Career Assistant API running smoothly'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in production mode on port ${PORT}`);
  console.log(`👉 API Health Check available at http://localhost:${PORT}/`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
