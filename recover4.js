const fs = require('fs');

const logPath = String.raw`C:\Users\RISHVANTH A\.gemini\antigravity-ide\brain\c43a8705-3d9e-485f-9089-e2148dfbbb6e\.system_generated\logs\transcript.jsonl`;
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

const fileLines = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'TOOL_RESPONSE' && entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        if (tc.function && tc.function.name === 'view_file' && tc.response && tc.response.output) {
          const content = tc.response.output;
          if (content.includes('AuthModal.tsx') && content.includes('The following code has been modified to include a line number')) {
            const textLines = content.split('\n');
            for (const tline of textLines) {
              const m = tline.match(/^(\d+): (.*)/);
              if (m) {
                fileLines[parseInt(m[1])] = m[2];
              } else {
                const m2 = tline.match(/^(\d+):$/);
                if (m2) {
                  fileLines[parseInt(m2[1])] = '';
                }
              }
            }
          }
        }
      }
    }
  } catch(e) {}
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
