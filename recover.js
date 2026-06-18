const fs = require('fs');
const readline = require('readline');

const logPath = String.raw`C:\Users\RISHVANTH A\.gemini\antigravity-ide\brain\c43a8705-3d9e-485f-9089-e2148dfbbb6e\.system_generated\logs\transcript.jsonl`;

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const fileLines = {};

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'TOOL_RESPONSE' && entry.content && entry.content.includes('AuthModal.tsx') && entry.content.includes('The following code has been modified')) {
        const lines = entry.content.split('\n');
        for (const l of lines) {
          const match = l.match(/^(\d+): (.*)/);
          if (match) {
            fileLines[parseInt(match[1])] = match[2];
          } else {
            const matchEmpty = l.match(/^(\d+):$/);
            if (matchEmpty) {
              fileLines[parseInt(matchEmpty[1])] = '';
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const keys = Object.keys(fileLines).map(Number);
  if (keys.length === 0) {
    console.log('No lines found!');
    return;
  }
  
  const maxLine = Math.max(...keys);
  console.log(`Recovered up to line ${maxLine}`);
  const outLines = [];
  for (let i = 1; i <= maxLine; i++) {
    outLines.push(fileLines[i] !== undefined ? fileLines[i] : '');
  }

  fs.writeFileSync(String.raw`d:\Roteen\Roteen\website\src\features\auth\components\AuthModal.tsx`, outLines.join('\n') + '\n', { encoding: 'utf-8' });
  console.log('File written successfully.');
}

processLineByLine();
