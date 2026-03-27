const Waste = require('../models/Waste');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const { classifyWaste } = require('../ai/gemini');

exports.submitWaste = async (req, res) => {
  try {
    const { amount, category, description, imageBase64, useAI } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Please provide amount' });
    }

    let finalCategory = category || 'general';
    let predictedCategory;
    let confidence;

    if (useAI && description) {
      const aiResult = await classifyWaste(imageBase64, description);
      predictedCategory = aiResult.category;
      confidence = aiResult.confidence;
      if (!category && predictedCategory) {
        finalCategory = predictedCategory;
      }
    }

    const waste = new Waste({
      hospitalId: req.userId,
      amount,
      category: finalCategory,
      predictedCategory,
      confidence
    });

    await waste.save();

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let analytics = await Analytics.findOne({
      hospitalId: req.userId,
      date: { $gte: today }
    });

    if (!analytics) {
      analytics = new Analytics({
        hospitalId: req.userId,
        date: today,
        totalWaste: amount
      });
    } else {
      analytics.totalWaste += amount;
    }

    analytics.byCategory[finalCategory] = (analytics.byCategory[finalCategory] || 0) + amount;
    await analytics.save();

    res.status(201).json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWaste = async (req, res) => {
  try {
    const waste = await Waste.find({ hospitalId: req.userId }).sort({ submittedAt: -1 });
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecentWaste = async (req, res) => {
  try {
    const waste = await Waste.find({ hospitalId: req.userId })
      .sort({ submittedAt: -1 })
      .limit(10);
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
