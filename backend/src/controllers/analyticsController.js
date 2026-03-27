const Analytics = require('../models/Analytics');

exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      hospitalId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWasteTrends = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const trends = await Analytics.find({
      hospitalId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const data = trends.map(t => ({
      date: t.date.toISOString().split('T')[0],
      totalWaste: t.totalWaste
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

    const analytics = await Analytics.find({
      hospitalId: req.userId,
      date: { $gte: startDate }
    });

    const breakdown = {
      general: 0,
      infectious: 0,
      chemical: 0,
      radioactive: 0,
      pharmaceutical: 0
    };

    analytics.forEach(a => {
      Object.keys(a.byCategory).forEach(cat => {
        breakdown[cat] = (breakdown[cat] || 0) + a.byCategory[cat];
      });
    });

    res.json(breakdown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
