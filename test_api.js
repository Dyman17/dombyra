const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/repertoire',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.end();