const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");
const generateToken = require("../utils/token");
const upload = require("../utils/imageUpload");
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Ensure uploads directory exists
const createUploadsDir = async () => {
  const uploadDir = path.join(__dirname, '../uploads/profile-images');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Upload directory created/verified at:', uploadDir);
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
};

// Create upload directory immediately
createUploadsDir().catch(console.error);

// Helper function to safely delete a file
async function safeDeleteFile(filePath) {
  try {
    if (!filePath) return;
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log('Successfully deleted file:', filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File does not exist:', filePath);
    } else {
      console.error('Error deleting file:', error);
    }
  }
}

// Login Route
router.post("/login", async (req, res) => {
  const { email, password, userType } = req.body;

  console.log('Login attempt:', { email, userType });

  try {
    let user;
    if (userType === 'serviceProvider') {
      console.log('Searching for service provider with email:', email);
      user = await ServiceProvider.findOne({ email });
      if (!user) {
        console.log('Service provider not found:', email);
        return res.status(400).json({ message: "Invalid credentials" });
      }
      console.log('Service provider found:', {
        id: user._id,
        name: user.name,
        email: user.email,
        category: user.category
      });
    } else {
      console.log('Searching for user with email:', email);
      user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: "Invalid credentials" });
      }
      console.log('User found:', {
        id: user._id,
        name: user.name,
        email: user.email
      });
    }

    console.log('Verifying password for:', email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log('Password verified successfully');

    console.log('Generating token for:', email);
    const token = generateToken(user._id, userType);
    
    // Prepare response data based on user type
    const responseData = {
      token,
      userType,
      ...(userType === 'serviceProvider' 
        ? {
            serviceProvider: {
              id: user._id,
              name: user.name,
              email: user.email,
              category: user.category,
              image: user.image
            }
          }
        : {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              image: user.image
            }
          }
      )
    };

    console.log('Login successful for:', email);
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      email,
      userType
    });
    res.status(500).json({ 
      message: "An error occurred during login",
      error: error.message 
    });
  }
});

// Signup Route with image upload
router.post("/signup", upload.single('profileImage'), async (req, res) => {
  console.log('Received signup request:', {
    body: req.body,
    file: req.file,
    userType: req.body.userType
  });

  try {
    const { userType, name, email, phone, password, category, experience, price } = req.body;

    // Check if user exists in either collection
    const existingUser = await User.findOne({ email });
    const existingProvider = await ServiceProvider.findOne({ email });

    if (existingUser || existingProvider) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
      }
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === 'serviceProvider') {
      // Validate required fields for service provider
      const requiredFields = ['name', 'email', 'phone', 'password', 'category', 'experience', 'price'];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
        }
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Create service provider object
      const serviceProvider = new ServiceProvider({
        name,
        email,
        phone,
        password: hashedPassword,
        category: category.toLowerCase(),
        experience: Number(experience),
        price: Number(price),
        status: 'Online',
        image: req.file ? `/uploads/profile-images/${req.file.filename}` : null,
        rating: 0,
        reviews: []
      });

      console.log('Attempting to save service provider:', {
        ...serviceProvider.toObject(),
        password: '[HIDDEN]'
      });

      // Save to database
      const savedProvider = await serviceProvider.save();
      console.log('Service provider saved successfully:', savedProvider._id);

      res.status(201).json({
        message: 'Service provider registered successfully',
        provider: {
          id: savedProvider._id,
          name: savedProvider.name,
          email: savedProvider.email,
          category: savedProvider.category,
          image: savedProvider.image
        }
      });
    } else {
      // Regular user signup
      // Validate required fields for regular user
      const requiredFields = ['name', 'email', 'phone', 'password'];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
        }
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Create regular user object
      const user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        image: req.file ? `/uploads/profile-images/${req.file.filename}` : null,
        isVerified: false,
        totalBookings: 0
      });

      console.log('Attempting to save user:', {
        ...user.toObject(),
        password: '[HIDDEN]'
      });

      // Save to database
      const savedUser = await user.save();
      console.log('User saved successfully:', savedUser._id);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          image: savedUser.image
        }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    // Delete uploaded file if exists
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;
