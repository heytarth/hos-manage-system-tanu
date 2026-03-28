// Local development server
// For production, the app runs through api/index.js (Vercel serverless)

console.log('Starting server...');
const app = require('./api/index.js');
console.log('App loaded, configuring server...');
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  console.log('Starting listen on port', PORT);
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html\n`);
  });
}
