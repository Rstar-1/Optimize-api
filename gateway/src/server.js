const http = require('http');
const app = require('./app');
const { port, env } = require('./config/env');

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Gateway running in ${env} mode on port ${port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
