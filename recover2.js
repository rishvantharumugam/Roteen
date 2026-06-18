const fs = require('fs');

const logPath = String.raw`C:\Users\RISHVANTH A\.gemini\antigravity-ide\brain\c43a8705-3d9e-485f-9089-e2148dfbbb6e\.system_generated\logs\transcript.jsonl`;
const data = fs.readFileSync(logPath, 'utf8');

const fileLines = {};

// Use regex to find all instances of "\n1: " or just "\n\d+: " up to "\n\d+: "
// Since it's JSONL, newlines in strings are literal \n
const regex = /\\n(\d+): (.*?)(?=\\n\d+: |\\n|"\s*\})/g;

let match;
while ((match = regex.exec(data)) !== null) {
  fileLines[parseInt(match[1])] = match[2].replace(/\\\\/g, '\\').replace(/\\"/g, '"').replace(/\\n/g, '\n');
}

// also check for empty lines
const regexEmpty = /\\n(\d+):(?=\\n|"\s*\})/g;
while ((match = regexEmpty.exec(data)) !== null) {
  fileLines[parseInt(match[1])] = '';
}

// Special case for line 1 if it doesn't start with \n
const match1 = data.match(/"1: (.*?)(?=\\n2: )/);
if (match1) {
  fileLines[1] = match1[1].replace(/\\\\/g, '\\').replace(/\\"/g, '"');
}


const keys = Object.keys(fileLines).map(Number);
if (keys.length > 0) {
  const maxLine = Math.max(...keys);
  console.log(`Recovered up to line ${maxLine}`);
  const outLines = [];
  for (let i = 1; i <= maxLine; i++) {
    outLines.push(fileLines[i] !== undefined ? fileLines[i] : '');
  }
  fs.writeFileSync(String.raw`d:\Roteen\Roteen\website\src\features\auth\components\AuthModal.tsx`, outLines.join('\n') + '\n', 'utf8');
} else {
  console.log("No lines found.");
}
