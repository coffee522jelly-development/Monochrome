const fs = require('fs');
const path = require('path');

/**
 * Node.js based build script for TECH-MD Editor
 * This ensures cross-platform compatibility (Windows/macOS/Linux)
 * for the beforeBuildCommand in Tauri.
 */

const files = ['index.html', 'style.css', 'script.js'];
const distDir = path.join(__dirname, 'dist');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy required assets
  files.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      // Minimal output to avoid encoding issues in some environments
      process.stdout.write(`Done: ${file}\n`);
    } else {
      throw new Error(`Source file not found: ${file}`);
    }
  });

  process.exit(0);
} catch (err) {
  process.stderr.write(`Build Error: ${err.message}\n`);
  process.exit(1);
}
