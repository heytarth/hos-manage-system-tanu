const User = require('../models/User');
const Waste = require('../models/Waste');
const Compliance = require('../models/Compliance');

exports.getAllUsers = async (req, res) => {
  try {
    // Only admins can access this
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllWaste = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const waste = await Waste.findAll({
      include: {
        model: User,
        attributes: ['hospitalName', 'email']
      },
      order: [['submittedAt', 'DESC']]
    });
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllCompliance = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const compliance = await Compliance.findAll({
      include: {
        model: User,
        attributes: ['hospitalName', 'email']
      }
    });
    res.json(compliance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalUsers = await User.count();
    const totalWaste = await Waste.count();
    const totalHospitals = await User.count({ where: { role: 'hospital' } });

    const compliance = await Compliance.findAll();
    const avgCompliance = compliance.length > 0
      ? compliance.reduce((sum, c) => sum + c.complianceScore, 0) / compliance.length
      : 0;

    res.json({
      totalUsers,
      totalWaste,
      totalHospitals,
      avgCompliance: Math.round(avgCompliance * 10) / 10
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyWaste = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const waste = await Waste.findByPk(req.params.id);
    if (!waste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }

    if (waste.status !== 'pending') {
      return res.status(400).json({ error: `Only pending entries can be verified. Current status: ${waste.status}` });
    }

    waste.status = 'verified';
    await waste.save();

    res.json({ message: 'Waste entry verified successfully', waste });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
