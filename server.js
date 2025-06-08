// Simple HTTP server for ElevateElement

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle /htmx-current-time endpoint
  if (req.url === '/htmx-current-time') {
    const currentTime = new Date().toLocaleTimeString();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<span>${currentTime}</span>`);
    return;
  }

  // Handle /htmx-content.html endpoint
  if (req.url === '/htmx-content.html') {
    const htmxSnippetPath = path.join(__dirname, 'elevateElement/views/partials/htmx-content.html');
    fs.readFile(htmxSnippetPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading htmx-content.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
    return;
  }
  
  // Handle SPA routes - redirect to index.html
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  } else if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    // If no file extension and file doesn't exist, serve index.html for SPA routing
    filePath = './index.html';
  }
  
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
}); 