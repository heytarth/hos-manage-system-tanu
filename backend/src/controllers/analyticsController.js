const Analytics = require('../models/Analytics');
const { Op } = require('sequelize');
const { generateCSV, generatePDF, prepareAnalyticsData } = require('../utils/exportUtils');
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

function mergeAnalyticsByDate(records) {
  const byDate = new Map();

  records.forEach((entry) => {
    const row = entry.toJSON ? entry.toJSON() : entry;
    const dateObj = new Date(row.date);
    if (Number.isNaN(dateObj.getTime())) return;

    const dateKey = dateObj.toISOString().split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: new Date(`${dateKey}T00:00:00.000Z`),
        totalWaste: 0,
        byCategory: {
          general: 0,
          infectious: 0,
          chemical: 0,
          radioactive: 0,
          pharmaceutical: 0
        },
        recyclingPercentage: 0
      });
    }

    const acc = byDate.get(dateKey);
    acc.totalWaste += Number(row.totalWaste) || 0;

    const sourceByCategory = row.byCategory || {};
    Object.keys(acc.byCategory).forEach((cat) => {
      acc.byCategory[cat] += Number(sourceByCategory[cat]) || 0;
    });
  });

  const merged = Array.from(byDate.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  return merged.map((row) => {
    const recycledAmount = Number(row.byCategory.general) || 0;
    row.recyclingPercentage = row.totalWaste > 0
      ? Number(((recycledAmount / row.totalWaste) * 100).toFixed(2))
      : 0;
    return row;
  });
}

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

    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: { [Op.in]: hospitalUserIds },
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['id', 'hospitalName', 'email']
      }
    });

    res.json(withComputedRecycling(mergeAnalyticsByDate(analytics)));
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

    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const trends = await Analytics.findAll({
      where: {
        hospitalId: { [Op.in]: hospitalUserIds },
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['id', 'hospitalName']
      }
    });

    const mergedTrends = mergeAnalyticsByDate(trends);

    const data = mergedTrends.map(t => ({
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

    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: { [Op.in]: hospitalUserIds },
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

    const mergedAnalytics = mergeAnalyticsByDate(analytics);

    mergedAnalytics.forEach(a => {
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

    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: { [Op.in]: hospitalUserIds },
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareAnalyticsData(withComputedRecycling(mergeAnalyticsByDate(analytics)));
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

    const hospitalUserIds = await getHospitalUserIds(req.userId);

    const analytics = await Analytics.findAll({
      where: {
        hospitalId: { [Op.in]: hospitalUserIds },
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']],
      include: {
        model: User,
        attributes: ['hospitalName']
      }
    });

    const data = prepareAnalyticsData(withComputedRecycling(mergeAnalyticsByDate(analytics)));
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
