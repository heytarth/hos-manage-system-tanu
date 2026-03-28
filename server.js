// Local development server
// For production, the app runs through api/index.js (Vercel serverless)

console.log('Starting server...');
const app = require('./api/index.js');
console.log('App loaded, configuring server...');
const PORT = process.env.PORT || 3000;

function startServer(port) {
  console.log('Starting listen on port', port);
  const server = app.listen(port, () => {
    console.log(`\nServer running on http://localhost:${port}`);
    console.log(`Dashboard: http://localhost:${port}/dashboard.html\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.error(`Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw err;
  });
}

if (require.main === module) {
  startServer(PORT);
}
