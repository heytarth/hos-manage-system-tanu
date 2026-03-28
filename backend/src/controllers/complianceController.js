const Compliance = require('../models/Compliance');
const { generateCSV, generatePDF, prepareComplianceData } = require('../utils/exportUtils');
const User = require('../models/User');

exports.getCompliance = async (req, res) => {
  try {
    let compliance = await Compliance.findOne({
      where: { hospitalId: req.userId },
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });

    if (!compliance) {
      compliance = await Compliance.create({ hospitalId: req.userId });
      // Reload with association
      compliance = await Compliance.findOne({
        where: { hospitalId: req.userId },
        include: {
          model: User,
          attributes: ['id', 'hospitalName', 'email']
        }
      });
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

    let compliance = await Compliance.findOne({ where: { hospitalId: req.userId } });

    if (!compliance) {
      compliance = await Compliance.create({ hospitalId: req.userId });
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
    } else {
      compliance.suggestions = ['All compliance requirements met!'];
    }

    compliance.lastUpdated = new Date();
    await compliance.save();

    // Reload with association
    const updated = await Compliance.findOne({
      where: { hospitalId: req.userId },
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportComplianceCSV = async (req, res) => {
  try {
    const compliance = await Compliance.findOne({
      where: { hospitalId: req.userId },
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    if (!compliance) {
      return res.status(404).json({ error: 'No compliance data found' });
    }

    const data = prepareComplianceData([compliance]);
    const headers = ['Hospital', 'Score', 'Status', 'Waste Separation', 'Proper Bins', 'Documentation', 'Training', 'Last Updated'];
    const csv = await generateCSV(data, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="compliance-data.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportCompliancePDF = async (req, res) => {
  try {
    const compliance = await Compliance.findOne({
      where: { hospitalId: req.userId },
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    if (!compliance) {
      return res.status(404).json({ error: 'No compliance data found' });
    }

    const data = prepareComplianceData([compliance]);
    const headers = ['Hospital', 'Score', 'Status', 'Waste Separation', 'Proper Bins', 'Documentation', 'Training', 'Last Updated'];
    const pdf = await generatePDF('Compliance Report', 'Hospital Compliance Data', data, headers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compliance-data.pdf"');
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
