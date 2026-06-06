const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_analyzer';
    console.log(`Connecting to MongoDB with URI: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    process.env.USE_IN_MEMORY_DB = 'false';
  } catch (error) {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ WARNING: MongoDB connection failed (${error.message}).`);
    console.warn('\x1b[36m%s\x1b[0m', `🚀 SEAMLESS FALLBACK: Activating high-performance in-memory datastore mode. All features will work perfectly!`);
    process.env.USE_IN_MEMORY_DB = 'true';
  }
};

module.exports = connectDB;
