const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log('Request for:', req.url);
    
    let filePath;
    if (req.url === '/' || req.url === '') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else {
        filePath = path.join(__dirname, 'public', req.url);
    }
    
    console.log('Looking for file:', filePath);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('File not found:', filePath);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(`
                <h1>File not found</h1>
                <p>Looking for: ${filePath}</p>
                <p>Error: ${err.message}</p>
                <p>Current directory: ${__dirname}</p>
                <p>Files in public/:</p>
                <pre>${fs.existsSync('public') ? fs.readdirSync('public').join('\n') : 'public directory does not exist'}</pre>
            `);
            return;
        }
        
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.js') contentType = 'text/javascript';
        if (ext === '.css') contentType = 'text/css';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
    console.log('Current directory:', __dirname);
    console.log('Files in current directory:', fs.readdirSync('.'));
});
