const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require('fs').promises;
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', details: err.message });
});

app.use(express.json());
app.use(cors());

// Ensure uploads directory exists and serve uploaded files
const uploadsPath = path.resolve(__dirname, 'uploads');
const profileImagesPath = path.resolve(uploadsPath, 'profile-images');

// Create directories if they don't exist
async function ensureDirectories() {
  try {
    // Create parent directory first
    await fs.mkdir(uploadsPath, { recursive: true });
    console.log('Created uploads directory at:', uploadsPath);
    
    // Create profile images directory
    await fs.mkdir(profileImagesPath, { recursive: true });
    console.log('Created profile images directory at:', profileImagesPath);
    
    // Verify directories exist and are writable
    await fs.access(uploadsPath, fs.constants.W_OK);
    await fs.access(profileImagesPath, fs.constants.W_OK);
    
    console.log('Directories verified and writable');
  } catch (error) {
    console.error('Error setting up directories:', error);
    // Don't exit the process, but log the error
    console.error('Directory setup failed, but continuing...');
  }
}

// Ensure directories exist before starting the server
ensureDirectories().then(() => {
  // Serve static files only after ensuring directories exist
  app.use('/uploads', express.static(uploadsPath));
  console.log('Serving uploads from:', uploadsPath);
}).catch(error => {
  console.error('Failed to set up upload directories:', error);
});

// Connect to MongoDB with proper error handling
const MONGODB_URI = 'mongodb://127.0.0.1:27017/hireme';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected successfully");
  // Test the connection by listing collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:', collections.map(c => c.name));
    }
  });
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port or stop the existing process.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});
