const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'kg'
  },
  category: {
    type: String,
    enum: ['general', 'infectious', 'chemical', 'radioactive', 'pharmaceutical'],
    default: 'general'
  },
  predictedCategory: String,
  confidence: Number,
  imageUrl: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Waste', wasteSchema);
