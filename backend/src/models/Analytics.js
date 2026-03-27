const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalWaste: Number,
  byCategory: {
    general: { type: Number, default: 0 },
    infectious: { type: Number, default: 0 },
    chemical: { type: Number, default: 0 },
    radioactive: { type: Number, default: 0 },
    pharmaceutical: { type: Number, default: 0 }
  },
  recyclingPercentage: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
