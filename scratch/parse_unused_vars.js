const fs = require('fs');
const path = require('path');

const logFile = path.resolve(__dirname, '../.system_generated/tasks');
// Find the latest task log file in .system_generated/tasks
function getLatestLogFile() {
  const dirs = [
    path.join(__dirname, '../.system_generated/tasks'),
    path.join(process.env.USERPROFILE || '', '.gemini/antigravity-ide/brain/f1f29ba4-c762-4868-a891-db0dbef974a6/.system_generated/tasks')
  ];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.log'));
      if (files.length > 0) {
        // Sort by mtime
        files.sort((a, b) => {
          return fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs;
        });
        return path.join(dir, files[0]);
      }
    }
  }
  return null;
}

const latestLog = getLatestLogFile();
if (!latestLog) {
  console.error("No log file found.");
  process.exit(1);
}

console.log("Parsing log file:", latestLog);
const log = fs.readFileSync(latestLog, 'utf8');
const lines = log.split('\n');
let currentFile = '';

lines.forEach(line => {
  const trimmed = line.trim();
  // Match path like D:\Roteen\Roteen\website\src\app\page.tsx
  // or D:/Roteen/Roteen/website/src/app/page.tsx
  if (trimmed.match(/^[a-zA-Z]:[\\/]/) && !trimmed.match(/:\d+:\d+$/)) {
    currentFile = trimmed;
  }
  
  if (trimmed.includes('@typescript-eslint/no-unused-vars') || trimmed.includes('is defined but never used')) {
    console.log(`${path.relative(path.resolve(__dirname, '..'), currentFile).replace(/\\/g, '/')} : ${trimmed}`);
  }
});
