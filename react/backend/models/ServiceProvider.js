const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['plumber', 'carpenter', 'gardener', 'painter', 'electrician', 'cleaner'],
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online',
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  availability: [{
    date: Date,
    timeSlots: [String],
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema); 