const Analytics = require('../models/Analytics');
const { Op } = require('sequelize');
const { generateCSV, generatePDF, prepareAnalyticsData } = require('../utils/exportUtils');
const User = require('../models/User');

function withComputedRecycling(records) {
  return records.map((entry) => {
    const row = entry.toJSON ? entry.toJSON() : entry;
    const byCategory = row.byCategory || {};
    const totalWaste = Number(row.totalWaste) || 0;
    const recycledAmount = Number(byCategory.general) || 0;

    row.recyclingPercentage = totalWaste > 0
      ? Number(((recycledAmount / totalWaste) * 100).toFixed(2))
      : 0;

    return row;
  });
}

exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });

    res.json(withComputedRecycling(analytics));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWasteTrends = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const trends = await Analytics.findAll({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['id', 'hospitalName']
      }
    });

    const data = trends.map(t => ({
      date: t.date.toISOString().split('T')[0],
      totalWaste: t.totalWaste || 0
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: startDate }
      },
      include: {
        model: User,
        attributes: ['id', 'hospitalName']
      }
    });

    const breakdown = {
      general: 0,
      infectious: 0,
      chemical: 0,
      radioactive: 0,
      pharmaceutical: 0
    };

    analytics.forEach(a => {
      if (a.byCategory && typeof a.byCategory === 'object') {
        Object.keys(a.byCategory).forEach(cat => {
          breakdown[cat] = (breakdown[cat] || 0) + (a.byCategory[cat] || 0);
        });
      }
    });

    res.json(breakdown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportAnalyticsCSV = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareAnalyticsData(withComputedRecycling(analytics));
    const headers = ['Date', 'Total Waste (kg)', 'General', 'Infectious', 'Chemical', 'Radioactive', 'Pharmaceutical', 'Recycling %'];
    const csv = await generateCSV(data, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-data.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportAnalyticsPDF = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: req.userId,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareAnalyticsData(withComputedRecycling(analytics));
    const headers = ['Date', 'Total Waste (kg)', 'General', 'Infectious', 'Chemical', 'Radioactive', 'Pharmaceutical', 'Recycling %'];
    const pdf = await generatePDF('Analytics Report', `Waste Analytics - Last ${days} days`, data, headers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-data.pdf"');
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
