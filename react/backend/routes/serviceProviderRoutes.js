const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');

// Get all service providers
router.get('/', async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({ message: 'Error fetching service providers' });
  }
});

// Get service providers by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const providers = await ServiceProvider.find({ category: category.toLowerCase() });
    res.json(providers);
  } catch (error) {
    console.error('Error fetching service providers by category:', error);
    res.status(500).json({ message: 'Error fetching service providers' });
  }
});

// Get service provider by ID
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Error fetching service provider:', error);
    res.status(500).json({ message: 'Error fetching service provider' });
  }
});

// Update service provider status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Error updating service provider status:', error);
    res.status(500).json({ message: 'Error updating service provider status' });
  }
});

// Add review to service provider
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    provider.reviews.push({ userId, rating, comment });
    
    // Update average rating
    const totalRating = provider.reviews.reduce((sum, review) => sum + review.rating, 0);
    provider.rating = totalRating / provider.reviews.length;

    await provider.save();
    res.json(provider);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

module.exports = router; 