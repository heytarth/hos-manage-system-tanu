const Waste = require('../models/Waste');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const { classifyWaste } = require('../ai/gemini');
const { Op } = require('sequelize');
const { generateCSV, generatePDF, prepareWasteData } = require('../utils/exportUtils');
const User = require('../models/User');

async function getHospitalUserIds(userId) {
  const currentUser = await User.findByPk(userId, { attributes: ['hospitalName'] });
  if (!currentUser || !currentUser.hospitalName) {
    return [userId];
  }

  const sameHospitalUsers = await User.findAll({
    where: { hospitalName: currentUser.hospitalName },
    attributes: ['id']
  });

  const ids = sameHospitalUsers.map((u) => u.id);
  return ids.length > 0 ? ids : [userId];
}

exports.submitWaste = async (req, res) => {
  try {
    const { amount, category, description, imageBase64, useAI } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
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

    const waste = await Waste.create({
      hospitalId: req.userId,
      amount: numericAmount,
      category: finalCategory,
      predictedCategory,
      confidence
    });

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let analytics = await Analytics.findOne({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: today }
      }
    });

    if (!analytics) {
      analytics = await Analytics.create({
        hospitalId: req.userId,
        date: today,
        totalWaste: numericAmount,
        byCategory: { general: 0, infectious: 0, chemical: 0, radioactive: 0, pharmaceutical: 0 }
      });
    } else {
      analytics.totalWaste = (Number(analytics.totalWaste) || 0) + numericAmount;
    }

    const byCategory = {
      general: 0,
      infectious: 0,
      chemical: 0,
      radioactive: 0,
      pharmaceutical: 0,
      ...(analytics.get('byCategory') || {})
    };
    byCategory[finalCategory] = (Number(byCategory[finalCategory]) || 0) + numericAmount;
    analytics.setDataValue('byCategory', byCategory);
    analytics.changed('byCategory', true);

    // Recycled waste proxy: treat "general" category as recyclable stream.
    const recycledAmount = Number(byCategory.general) || 0;
    const totalWaste = Number(analytics.totalWaste) || 0;
    analytics.recyclingPercentage = totalWaste > 0
      ? Number(((recycledAmount / totalWaste) * 100).toFixed(2))
      : 0;

    await analytics.save();

    res.status(201).json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWaste = async (req, res) => {
  try {
    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const waste = await Waste.findAll({
      where: { hospitalId: { [Op.in]: hospitalUserIds } },
      order: [['submittedAt', 'DESC']],
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecentWaste = async (req, res) => {
  try {
    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const waste = await Waste.findAll({
      where: { hospitalId: { [Op.in]: hospitalUserIds } },
      order: [['submittedAt', 'DESC']],
      limit: 10,
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportWasteCSV = async (req, res) => {
  try {
    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const waste = await Waste.findAll({
      where: { hospitalId: { [Op.in]: hospitalUserIds } },
      order: [['submittedAt', 'DESC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareWasteData(waste);
    const headers = ['ID', 'Hospital', 'Amount', 'Unit', 'Category', 'Status', 'Predicted Category', 'Confidence', 'Submitted'];
    const csv = await generateCSV(data, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waste-data.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportWastePDF = async (req, res) => {
  try {
    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const waste = await Waste.findAll({
      where: { hospitalId: { [Op.in]: hospitalUserIds } },
      order: [['submittedAt', 'DESC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareWasteData(waste);
    const headers = ['ID', 'Hospital', 'Amount', 'Unit', 'Category', 'Status', 'Predicted Category', 'Confidence', 'Submitted'];
    const pdf = await generatePDF('Waste Management Report', 'Hospital Waste Data Export', data, headers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="waste-data.pdf"');
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
