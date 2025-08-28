const { createServer } = require('https');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

// SSL certificate paths
const keyPath = path.join(__dirname, 'certs', 'localhost+2-key.pem');
const certPath = path.join(__dirname, 'certs', 'localhost+2.pem');

// Check if certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('SSL certificates not found, starting HTTP server...');
  // Start the built-in Next.js server
  require('./server.js');
} else {
  console.log('SSL certificates found, starting HTTPS server...');
  
  // Import the built-in Next.js server handler
  const serverHandler = require('./server.js');
  
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  const server = createServer(httpsOptions, (req, res) => {
    // Proxy to the Next.js server
    serverHandler(req, res);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on https://${hostname}:${port}`);
  });
}