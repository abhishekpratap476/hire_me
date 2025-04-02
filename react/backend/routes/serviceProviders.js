const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Service provider API is working' });
});

// Get all service providers
router.get('/service-providers', async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get service providers by category
router.get('/service-providers/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const providers = await ServiceProvider.find({ category });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get service provider by ID
router.get('/service-providers/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get service provider reviews
router.get('/service-providers/:id/reviews', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json(provider.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service provider availability
router.put('/service-providers/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add some sample data (temporary endpoint for testing)
router.post('/sample-data', async (req, res) => {
  try {
    const sampleProviders = [
      {
        name: "Michael Anderson",
        category: "plumber",
        rating: 4.8,
        experience: 8,
        price: 45,
        status: "Online",
        image: "https://public.readdy.ai/ai/img_res/5836fc64412eba247fd9f48894b0ea3b.jpg",
      },
      {
        name: "Robert Williams",
        category: "carpenter",
        rating: 4.9,
        experience: 12,
        price: 55,
        status: "Online",
        image: "https://public.readdy.ai/ai/img_res/ba8d3ac936e4bee8385d03d11fd48c73.jpg",
      },
      {
        name: "Emily Parker",
        category: "gardener",
        rating: 4.7,
        experience: 6,
        price: 40,
        status: "Offline",
        image: "https://public.readdy.ai/ai/img_res/2e0746b740edfef4f4e44e5b8ca36408.jpg",
      }
    ];

    await ServiceProvider.insertMany(sampleProviders);
    res.json({ message: 'Sample data added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 