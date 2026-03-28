const PDFDocument = require('pdfkit');

// Generate CSV from data
exports.generateCSV = async (data, headers) => {
  return new Promise((resolve, reject) => {
    let csv = '';
    
    // Add headers
    csv += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        // Handle nested objects/arrays
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        // Convert to string and escape quotes in CSV
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
      csv += values.join(',') + '\n';
    });
    
    resolve(csv);
  });
};

// Generate PDF from data
exports.generatePDF = async (title, subtitle, data, headers) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      
      // Header
      doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(subtitle, { align: 'center' });
      doc.moveDown();
      
      // Generated date
      doc.fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();
      
      // Table
      if (data && data.length > 0) {
        const columnWidths = 560 / headers.length;
        const startY = doc.y;
        
        // Headers
        doc.fontSize(9).font('Helvetica-Bold');
        headers.forEach((header, i) => {
          doc.text(header, 50 + i * columnWidths, startY, {
            width: columnWidths,
            align: 'left',
            ellipsis: true
          });
        });
        
        doc.moveTo(50, doc.y + 5).lineTo(610, doc.y + 5).stroke();
        doc.moveDown(0.5);
        
        // Data rows
        doc.fontSize(8).font('Helvetica');
        data.forEach((row, rowIndex) => {
          const rowY = doc.y;
          
          headers.forEach((header, colIndex) => {
            let value = row[header];
            if (value === null || value === undefined) {
              value = 'N/A';
            }
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            }
            value = String(value).substring(0, 50); // Truncate long values
            
            doc.text(value, 50 + colIndex * columnWidths, rowY, {
              width: columnWidths,
              align: 'left',
              ellipsis: true
            });
          });
          
          doc.moveDown(1.2);
        });
      } else {
        doc.text('No data available');
      }
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Prepare waste data for export
exports.prepareWasteData = (wastes) => {
  return wastes.map(w => ({
    'ID': w.id || 'N/A',
    'Hospital': (w.User && w.User.hospitalName) || 'N/A',
    'Amount': w.amount || 0,
    'Unit': w.unit || 'kg',
    'Category': w.category || 'N/A',
    'Status': w.status || 'N/A',
    'Predicted Category': w.predictedCategory || 'N/A',
    'Confidence': w.confidence ? `${(w.confidence * 100).toFixed(2)}%` : 'N/A',
    'Submitted': w.submittedAt ? new Date(w.submittedAt).toLocaleDateString() : 'N/A'
  }));
};

// Prepare analytics data for export
exports.prepareAnalyticsData = (analytics) => {
  return analytics.map(a => {
    const byCategory = a.byCategory || {};
    return {
      'Date': a.date ? new Date(a.date).toLocaleDateString() : 'N/A',
      'Total Waste (kg)': a.totalWaste || 0,
      'General': byCategory.general || 0,
      'Infectious': byCategory.infectious || 0,
      'Chemical': byCategory.chemical || 0,
      'Radioactive': byCategory.radioactive || 0,
      'Pharmaceutical': byCategory.pharmaceutical || 0,
      'Recycling %': a.recyclingPercentage || 0
    };
  });
};

// Prepare compliance data for export
exports.prepareComplianceData = (compliances) => {
  return compliances.map(c => ({
    'Hospital': (c.User && c.User.hospitalName) || 'N/A',
    'Score': c.complianceScore || 0,
    'Status': c.status || 'N/A',
    'Waste Separation': c.wasteSeparation ? 'Yes' : 'No',
    'Proper Bins': c.properBins ? 'Yes' : 'No',
    'Documentation': c.documentation ? 'Yes' : 'No',
    'Training': c.training ? 'Yes' : 'No',
    'Last Updated': c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : 'N/A'
  }));
};
