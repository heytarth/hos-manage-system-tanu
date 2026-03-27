const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complianceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pass', 'fail'],
    default: 'fail'
  },
  wasteSeparation: {
    type: Boolean,
    default: false
  },
  properBins: {
    type: Boolean,
    default: false
  },
  documentation: {
    type: Boolean,
    default: false
  },
  training: {
    type: Boolean,
    default: false
  },
  suggestions: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Compliance', complianceSchema);
