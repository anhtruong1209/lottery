import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'dist');
const targetDir = path.join(__dirname, '..', '..', 'Backend', 'wwwroot');

// Create wwwroot if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Created wwwroot directory');
}

// Function to copy directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all files from dist to wwwroot
try {
  // Remove existing files in wwwroot (except web.config if exists)
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    files.forEach(file => {
      const filePath = path.join(targetDir, file);
      if (file !== 'web.config') {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    });
  }

  // Copy new files
  copyRecursiveSync(sourceDir, targetDir);
  
  // Copy web.config to wwwroot (needed for IIS)
  const webConfigSource = path.join(__dirname, '..', '..', 'Backend', 'web.config');
  const webConfigTarget = path.join(targetDir, 'web.config');
  if (fs.existsSync(webConfigSource)) {
    fs.copyFileSync(webConfigSource, webConfigTarget);
    console.log('✓ Copied web.config to wwwroot');
  } else {
    console.warn('⚠ web.config not found in root directory');
  }

  console.log('✓ Successfully copied build files to Backend/wwwroot');
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
}

