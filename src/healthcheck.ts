import http from 'http';

const options = {
  host: 'localhost',
  path: '/api/v1/health',
  port: process.env.PORT || 3000,
  timeout: 2000, // 2 second timeout
};

// @ts-ignore
const request = http.request(options, (res) => {
  // Exit 0 on success, 1 on failure
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on('error', () => {
  process.exit(1);
});

request.end();
