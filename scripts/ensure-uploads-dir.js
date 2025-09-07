const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');

console.log('Ensuring uploads directory exists at:', uploadsDir);

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  } else {
    console.log('Uploads directory already exists');
  }
  
  // Test write permissions
  const testFile = path.join(uploadsDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  
  console.log('Directory is writable');
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
