const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      serviceProviderId,
      serviceType,
      date,
      time,
      location,
      description,
      totalAmount,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!serviceProviderId || !serviceType || !date || !time || !location || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate date and time
    const bookingDate = new Date(date);
    const currentDate = new Date();
    
    if (bookingDate < currentDate) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    // Check if service provider exists and is available
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    if (serviceProvider.status !== 'active') {
      return res.status(400).json({ message: 'Service provider is not available' });
    }

    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({
      serviceProvider: serviceProviderId,
      date: bookingDate,
      time,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Service provider is already booked for this time slot' });
    }

    // Create new booking
    const booking = new Booking({
      client: req.user._id,
      serviceProvider: serviceProviderId,
      serviceType,
      date: bookingDate,
      time,
      location,
      description,
      totalAmount,
      paymentMethod,
      status: 'pending'
    });

    await booking.save();

    // Populate the booking with client and service provider details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    res.status(201).json({ 
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Get client's bookings
router.get('/client', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { client: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('serviceProvider', 'name email image profession category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get provider's all bookings
router.get('/provider', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'serviceProvider') {
      return res.status(403).json({ message: 'Access denied. Only service providers can view bookings.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { serviceProvider: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name email image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get provider's pending booking requests
router.get('/provider/requests', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'serviceProvider') {
      return res.status(403).json({ message: 'Access denied. Only service providers can view booking requests.' });
    }

    const requests = await Booking.find({
      serviceProvider: req.user._id,
      status: 'pending'
    })
    .populate('client', 'name email image')
    .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ message: 'Error fetching booking requests' });
  }
});

// Accept a booking request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.serviceProvider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the assigned service provider can accept bookings.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'This booking cannot be accepted' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      serviceProvider: req.user._id,
      date: booking.date,
      time: booking.time,
      status: 'accepted',
      _id: { $ne: booking._id }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'You already have an accepted booking for this time slot' });
    }

    booking.status = 'accepted';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    res.json({ 
      message: 'Booking accepted successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ message: 'Error accepting booking' });
  }
});

// Reject a booking request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.serviceProvider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the assigned service provider can reject bookings.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'This booking cannot be rejected' });
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    res.json({ 
      message: 'Booking rejected successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Error rejecting booking' });
  }
});

// Complete a booking
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.serviceProvider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the assigned service provider can complete bookings.' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted bookings can be completed' });
    }

    booking.status = 'completed';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    res.json({ 
      message: 'Booking completed successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Error completing booking' });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only client or service provider can cancel
    if (booking.client.toString() !== req.user._id.toString() && 
        booking.serviceProvider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the client or service provider can cancel bookings.' });
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Get booking status by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email image')
      .populate('serviceProvider', 'name email image profession category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client._id.toString() !== req.user._id.toString() && 
        booking.serviceProvider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not authorized to view this booking.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking details' });
  }
});

module.exports = router; 