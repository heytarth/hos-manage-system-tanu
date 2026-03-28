// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    window.location.href = '/';
    return;
  }

  const userData = JSON.parse(user);
  document.getElementById('userHospital').textContent = userData.hospitalName;
  document.getElementById('userEmail').textContent = userData.email;

  // Show admin link if user is admin
  if (userData.role === 'admin') {
    document.getElementById('adminLink').style.display = 'block';
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

let dashboardWasteChart = null;
let dashboardCategoryChart = null;
let analyticsTrendChart = null;
let analyticsRecyclingChart = null;

// Page Navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Remove active class from all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected page
  document.getElementById(pageName).classList.add('active');

  // Add active class to corresponding sidebar item
  event.target.classList.add('active');

  // Load page-specific data
  if (pageName === 'dashboard') {
    loadDashboard();
  } else if (pageName === 'waste') {
    loadWasteHistory();
  } else if (pageName === 'compliance') {
    loadCompliance();
  } else if (pageName === 'analytics') {
    loadAnalytics();
  } else if (pageName === 'admin') {
    loadAdminPanel();
  }
}

// Dashboard Functions
async function loadDashboard() {
  try {
    // Load waste data
    const wasteRes = await fetch('/api/waste/recent', {
      headers: getAuthHeader()
    });
    const waste = await wasteRes.json();

    // Load compliance data
    const complianceRes = await fetch('/api/compliance', {
      headers: getAuthHeader()
    });
    const compliance = await complianceRes.json();

    // Load all waste for chart
    const allWasteRes = await fetch('/api/waste/all', {
      headers: getAuthHeader()
    });
    const allWaste = await allWasteRes.json();

    // Update stats
    const totalWaste = allWaste.reduce((sum, w) => sum + w.amount, 0);
    document.getElementById('totalWaste').textContent = totalWaste.toFixed(1) + ' kg';
    document.getElementById('complianceScore').textContent = compliance.complianceScore + '%';
    document.getElementById('alertCount').textContent = compliance.complianceScore < 60 ? '⚠️ 1' : '✓ 0';
    document.getElementById('submissionCount').textContent = allWaste.length;

    // Update alerts
    updateAlerts(compliance);

    // Update activity table
    updateActivityTable(waste);

    // Load charts
    loadDashboardCharts(allWaste);
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function updateAlerts(compliance) {
  const container = document.getElementById('alertsContainer');
  container.innerHTML = '';

  if (compliance.complianceScore < 60) {
    container.innerHTML = `
      <div class="alert alert-warning">
        ⚠️ Your compliance score is below 60%. Please review our suggestions.
      </div>
    `;
  } else if (compliance.complianceScore >= 100) {
    container.innerHTML = `
      <div class="alert alert-success">
        ✓ Excellent compliance! You're meeting all requirements.
      </div>
    `;
  }
}

function updateActivityTable(waste) {
  const tbody = document.getElementById('activityTable');
  
  if (waste.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No activity yet</td></tr>';
    return;
  }

  tbody.innerHTML = waste.map(w => `
    <tr>
      <td>${new Date(w.submittedAt).toLocaleDateString()}</td>
      <td>${w.category}</td>
      <td>${w.amount} kg</td>
      <td><span class="badge badge-${w.status}">${w.status}</span></td>
    </tr>
  `).join('');
}

function loadDashboardCharts(waste) {
  const wasteEntries = Array.isArray(waste) ? waste : [];

  const toLocalDateKey = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Build real daily totals for the last 7 days.
  const dayBuckets = [];
  const dayTotals = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = toLocalDateKey(d);
    dayBuckets.push({ key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    dayTotals[key] = 0;
  }

  wasteEntries.forEach((entry) => {
    if (!entry?.submittedAt) return;
    const key = toLocalDateKey(entry.submittedAt);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(dayTotals, key)) {
      dayTotals[key] += Number(entry.amount) || 0;
    }
  });

  // Weekly waste chart
  const ctx = document.getElementById('wasteChart')?.getContext('2d');
  if (ctx) {
    if (dashboardWasteChart) {
      dashboardWasteChart.destroy();
    }

    let labels = dayBuckets.map((d) => d.label);
    let data = dayBuckets.map((d) => Number(dayTotals[d.key].toFixed(2)));

    // Fallback: if weekly buckets are empty but submissions exist, plot the latest 7 submissions.
    const weeklyTotal = data.reduce((sum, value) => sum + value, 0);
    if (weeklyTotal === 0 && wasteEntries.length > 0) {
      const latestEntries = [...wasteEntries]
        .filter((entry) => entry?.submittedAt)
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
        .slice(-7);

      if (latestEntries.length > 0) {
        labels = latestEntries.map((entry) => new Date(entry.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data = latestEntries.map((entry) => Number((Number(entry.amount) || 0).toFixed(2)));
      }
    }

    const maxValue = Math.max(...data, 0);
    const suggestedMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

    dashboardWasteChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Waste (kg)',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax,
            ticks: { color: '#9ca3af' },
            grid: { color: '#f3f4f6' }
          },
          x: {
            ticks: { color: '#9ca3af' },
            grid: { color: '#f3f4f6' }
          }
        }
      }
    });
  }

  // Category pie chart
  const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
  if (categoryCtx) {
    if (dashboardCategoryChart) {
      dashboardCategoryChart.destroy();
    }

    const categoryTotals = {
      general: 0,
      infectious: 0,
      chemical: 0,
      radioactive: 0,
      pharmaceutical: 0
    };

    wasteEntries.forEach((entry) => {
      const category = entry?.category || 'general';
      const amount = Number(entry?.amount) || 0;
      if (Object.prototype.hasOwnProperty.call(categoryTotals, category)) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = labels.map((key) => Number(categoryTotals[key].toFixed(2)));
    const totalCategoryAmount = values.reduce((sum, value) => sum + value, 0);

    const chartLabels = totalCategoryAmount > 0 ? labels : ['No Data'];
    const chartValues = totalCategoryAmount > 0 ? values : [1];
    const chartColors = totalCategoryAmount > 0
      ? ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
      : ['#e5e7eb'];

    dashboardCategoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartValues,
          backgroundColor: chartColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Waste Functions
async function loadWasteHistory() {
  try {
    const response = await fetch('/api/waste/all', {
      headers: getAuthHeader()
    });
    const waste = await response.json();

    const tbody = document.getElementById('wasteHistoryTable');
    if (waste.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No waste submissions yet</td></tr>';
      return;
    }

    tbody.innerHTML = waste.map(w => `
      <tr>
        <td>${new Date(w.submittedAt).toLocaleDateString()}</td>
        <td>${w.category}</td>
        <td>${w.amount} kg</td>
        <td><span class="badge badge-${w.status}">${w.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading waste history:', err);
  }
}

document.getElementById('wasteForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = document.getElementById('wasteAmount').value;
  const category = document.getElementById('wasteCategory').value;

  try {
    const response = await fetch('/api/waste/submit', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ amount: parseFloat(amount), category })
    });

    if (response.ok) {
      alert('Waste submitted successfully');
      document.getElementById('wasteForm').reset();
      loadWasteHistory();
    } else {
      alert('Failed to submit waste');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred');
  }
});

// Compliance Functions
async function loadCompliance() {
  try {
    const response = await fetch('/api/compliance', {
      headers: getAuthHeader()
    });
    const compliance = await response.json();

    document.getElementById('scoreValue').textContent = compliance.complianceScore + '/100';
    document.getElementById('scoreStatus').textContent = compliance.status === 'pass' ? '✓ Compliant' : '✗ Not Compliant';
    document.getElementById('scoreStatus').style.color = compliance.status === 'pass' ? 'var(--success)' : 'var(--danger)';

    // Update checkboxes
    document.getElementById('waste-segregation').checked = compliance.wasteSeparation;
    document.getElementById('proper-bins').checked = compliance.properBins;
    document.getElementById('documentation').checked = compliance.documentation;
    document.getElementById('training').checked = compliance.training;

    // Display suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    if (compliance.suggestions && compliance.suggestions.length > 0) {
      suggestionsList.innerHTML = compliance.suggestions.map(s => `
        <div style="padding: 10px; background-color: var(--light-gray); border-radius: 6px; margin-bottom: 8px;">
          📌 ${s}
        </div>
      `).join('');
    } else {
      suggestionsList.innerHTML = '<p style="color: var(--gray);">No suggestions - Keep up the good work!</p>';
    }

    // Draw gauge chart
    drawGauge(compliance.complianceScore);
  } catch (err) {
    console.error('Error loading compliance:', err);
  }
}

function drawGauge(score) {
  const ctx = document.getElementById('scoreGauge')?.getContext('2d');
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [score, 100 - score],
          backgroundColor: [score >= 60 ? '#10b981' : '#ef4444', '#e5e7eb']
        }]
      },
      options: {
        responsive: true,
        circumference: 180,
        rotation: 270,
        plugins: { legend: { display: false } }
      }
    });
  }
}

async function updateCompliance() {
  const wasteSeparation = document.getElementById('waste-segregation').checked;
  const properBins = document.getElementById('proper-bins').checked;
  const documentation = document.getElementById('documentation').checked;
  const training = document.getElementById('training').checked;

  try {
    const response = await fetch('/api/compliance/update', {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ wasteSeparation, properBins, documentation, training })
    });

    if (response.ok) {
      loadCompliance();
    }
  } catch (err) {
    console.error('Error updating compliance:', err);
  }
}

// Analytics Functions
async function loadAnalytics() {
  try {
    const period = document.getElementById('analyticsPeriod').value || '7';
    const response = await fetch(`/api/analytics?period=${period}`, {
      headers: getAuthHeader()
    });
    const analytics = await response.json();

    // Load trends
    loadTrendChart(analytics);
    loadRecyclingChart(analytics);
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

function loadTrendChart(analytics) {
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (ctx) {
    if (analyticsTrendChart) {
      analyticsTrendChart.destroy();
    }

    const labels = (analytics || []).map(a => new Date(a.date).toLocaleDateString());
    const data = (analytics || []).map(a => Number(a.totalWaste) || 0);

    const chartLabels = labels.length > 0 ? labels : ['No Data'];
    const chartData = data.length > 0 ? data : [0];

    analyticsTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Total Waste (kg)',
          data: chartData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#f3f4f6' } },
          x: { ticks: { color: '#9ca3af' }, grid: { color: '#f3f4f6' } }
        }
      }
    });
  }
}

function loadRecyclingChart(analytics) {
  const ctx = document.getElementById('recyclingChart')?.getContext('2d');
  if (ctx) {
    if (analyticsRecyclingChart) {
      analyticsRecyclingChart.destroy();
    }

    const labels = (analytics || []).map(a => new Date(a.date).toLocaleDateString());
    const data = (analytics || []).map(a => {
      const value = Number(a.recyclingPercentage) || 0;
      return Number(value.toFixed(2));
    });

    const chartLabels = labels.length > 0 ? labels : ['No Data'];
    const chartData = data.length > 0 ? data : [0];

    analyticsRecyclingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Recycling Rate (%)',
          data: chartData,
          backgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af' }, grid: { color: '#f3f4f6' } },
          x: { ticks: { color: '#9ca3af' }, grid: { color: '#f3f4f6' } }
        }
      }
    });
  }
}

async function exportAnalyticsPDF() {
  try {
    const period = document.getElementById('analyticsPeriod')?.value || '30';
    const response = await fetch(`/api/analytics/export/pdf?period=${period}`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting PDF:', err);
    alert('Failed to export PDF');
  }
}

async function exportAnalyticsCSV() {
  try {
    const period = document.getElementById('analyticsPeriod')?.value || '30';
    const response = await fetch(`/api/analytics/export/csv?period=${period}`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    alert('Failed to export CSV');
  }
}

async function exportWastePDF() {
  try {
    const response = await fetch('/api/waste/export/pdf', {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting PDF:', err);
    alert('Failed to export PDF');
  }
}

async function exportWasteCSV() {
  try {
    const response = await fetch('/api/waste/export/csv', {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    alert('Failed to export CSV');
  }
}

async function exportCompliancePDF() {
  try {
    const response = await fetch('/api/compliance/export/pdf', {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting PDF:', err);
    alert('Failed to export PDF');
  }
}

async function exportComplianceCSV() {
  try {
    const response = await fetch('/api/compliance/export/csv', {
      headers: getAuthHeader()
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    alert('Failed to export CSV');
  }
}

// Keep old names for backward compatibility
function exportPDF() {
  exportAnalyticsPDF();
}

function exportCSV() {
  exportAnalyticsCSV();
}

// Admin Panel Functions
async function loadAdminPanel() {
  try {
    // Load stats
    const statsRes = await fetch('/api/admin/stats', {
      headers: getAuthHeader()
    });
    const stats = await statsRes.json();

    document.getElementById('totalHospitals').textContent = stats.totalHospitals;
    document.getElementById('totalAdminUsers').textContent = stats.totalUsers;
    document.getElementById('totalAdminWaste').textContent = stats.totalWaste;
    document.getElementById('avgCompliance').textContent = stats.avgCompliance + '%';

    // Load users
    const usersRes = await fetch('/api/admin/users', {
      headers: getAuthHeader()
    });
    const users = await usersRes.json();
    updateHospitalsTable(users);

    // Load waste
    const wasteRes = await fetch('/api/admin/waste', {
      headers: getAuthHeader()
    });
    const waste = await wasteRes.json();
    updateAdminWasteTable(waste.slice(0, 10));
  } catch (err) {
    console.error('Error loading admin panel:', err);
  }
}

function updateHospitalsTable(users) {
  const tbody = document.getElementById('hospitalsTable');
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No hospitals found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.hospitalName}</td>
      <td>${u.email}</td>
      <td><span class="badge" style="background-color: #d1fae5; color: #059669;">${u.role}</span></td>
      <td>${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function updateAdminWasteTable(waste) {
  const tbody = document.getElementById('adminWasteTable');
  if (waste.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--gray);">No waste entries found</td></tr>';
    return;
  }

  tbody.innerHTML = waste.map(w => `
    <tr>
      <td>${w.hospitalId?.hospitalName || 'Unknown'}</td>
      <td>${w.amount} kg</td>
      <td>${w.category}</td>
      <td><span class="badge badge-${w.status}">${w.status}</span></td>
      <td>${new Date(w.submittedAt).toLocaleDateString()}</td>
      <td>
        ${w.status === 'pending'
          ? `<button class="btn btn-primary" style="padding: 6px 10px; font-size: 12px;" onclick="verifyWasteEntry('${w._id}')">Verify</button>`
          : '<span style="color: var(--gray); font-size: 12px;">No Action</span>'}
      </td>
    </tr>
  `).join('');
}

async function verifyWasteEntry(wasteId) {
  try {
    const response = await fetch(`/api/admin/waste/${wasteId}/verify`, {
      method: 'PUT',
      headers: getAuthHeader()
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Failed to verify waste entry');
      return;
    }

    alert('Waste entry verified successfully');
    loadAdminPanel();
    loadDashboard();
  } catch (err) {
    console.error('Error verifying waste entry:', err);
    alert('An error occurred while verifying this waste entry');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadDashboard();
});
