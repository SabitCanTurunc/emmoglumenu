const fs = require('fs');

// Create a dummy 6MB file
const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
fs.writeFileSync('big.png', bigBuffer);

// Create a dummy 1MB file
const smallBuffer = Buffer.alloc(1 * 1024 * 1024);
fs.writeFileSync('small.png', smallBuffer);

console.log('Files created for manual testing.');
