const fs = require('fs-extra');
const path = require('path');

async function copySharedFiles() {
  try {
    // Copy shared directory to dist
    await fs.copy(
      path.join(__dirname, 'src/shared'),
      path.join(__dirname, 'dist/shared')
    );
    console.log('Shared files copied successfully');
  } catch (err) {
    console.error('Error copying shared files:', err);
    process.exit(1);
  }
}

copySharedFiles(); 