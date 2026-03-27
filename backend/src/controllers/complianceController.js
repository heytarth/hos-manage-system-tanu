const Compliance = require('../models/Compliance');

exports.getCompliance = async (req, res) => {
  try {
    let compliance = await Compliance.findOne({ hospitalId: req.userId });

    if (!compliance) {
      compliance = new Compliance({ hospitalId: req.userId });
      await compliance.save();
    }

    res.json(compliance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCompliance = async (req, res) => {
  try {
    const { wasteSeparation, properBins, documentation, training } = req.body;

    let compliance = await Compliance.findOne({ hospitalId: req.userId });

    if (!compliance) {
      compliance = new Compliance({ hospitalId: req.userId });
    }

    compliance.wasteSeparation = wasteSeparation || false;
    compliance.properBins = properBins || false;
    compliance.documentation = documentation || false;
    compliance.training = training || false;

    // Calculate score
    let score = 0;
    if (compliance.wasteSeparation) score += 25;
    if (compliance.properBins) score += 25;
    if (compliance.documentation) score += 25;
    if (compliance.training) score += 25;

    compliance.complianceScore = score;
    compliance.status = score >= 60 ? 'pass' : 'fail';

    if (score < 100) {
      compliance.suggestions = [];
      if (!compliance.wasteSeparation) compliance.suggestions.push('Implement proper waste segregation practices');
      if (!compliance.properBins) compliance.suggestions.push('Ensure proper waste bins are in place');
      if (!compliance.documentation) compliance.suggestions.push('Improve waste documentation and tracking');
      if (!compliance.training) compliance.suggestions.push('Provide training to staff on waste management');
    }

    await compliance.save();

    res.json(compliance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
