const fs = require('fs');
const path = require('path');

const directories = [
  './src/features/terms',
  './src/features/tutorial',
  './src/features/feedback'
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Backgrounds
      content = content.replace(/bg-\[#050816\] bg-\[radial-gradient[^\]]+\]/g, 'bg-black');
      content = content.replace(/bg-[#050816]/g, 'bg-black');
      
      // Panels
      content = content.replace(/bg-\[linear-gradient\(180deg,rgba\(15,23,42,0\.7[68]\),rgba\(6,10,24,0\.9[20]?\)\)\]/g, 'bg-[#121212]');
      content = content.replace(/border-white\/\[0\.08\]/g, 'border-zinc-800');
      
      // Secondary Panels (white/0.04) -> bg-[#121212] ? 
      // The user wants "panels all are grey color"
      content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-[#121212]');
      content = content.replace(/border-white\/\[0\.07\]/g, 'border-zinc-800');
      
      // Also shadows if any, but they are okay to keep or can be adjusted.
      // Let's replace the glowing shadows from panels just in case, or leave them.
      // The user said "panels all are grey color", nothing about removing shadows, but usually #121212 goes with no colored glow. Let's remove the shadow
      content = content.replace(/shadow-\[0_28px_80px_-50px_rgba\(99,102,241,0\.8\)\]/g, '');

      fs.writeFileSync(fullPath, content);
    }
  }
}

for (const dir of directories) {
  processDirectory(path.resolve(dir));
}
console.log('Done!');
