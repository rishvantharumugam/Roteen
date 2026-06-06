const fs = require('fs');
const path = require('path');

const moves = JSON.parse(fs.readFileSync('moves.json', 'utf-8'));

// Build a mapping of old import paths to new import paths.
// old: "service/videoSubjectService" -> new: "features/video/services/videoSubjectService"
const importMapping = {};

moves.forEach(m => {
    // Remove "src/" from the beginning and ".ts" or ".tsx" from the end
    let oldPath = m.from.replace(/^.*\/src\//, '').replace(/\.tsx?$/, '');
    let newPath = m.to.replace(/\.tsx?$/, '');
    
    // Also handle index files specifically
    if (oldPath.endsWith('/index')) {
        importMapping[oldPath.slice(0, -6)] = newPath.endsWith('/index') ? newPath.slice(0, -6) : newPath;
    }
    
    importMapping[oldPath] = newPath;
});

// Sort by length descending to replace more specific paths first
const sortedOldPaths = Object.keys(importMapping).sort((a, b) => b.length - a.length);

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;

            // Simple string replacement for @/ imports
            for (const oldP of sortedOldPaths) {
                const newP = importMapping[oldP];
                
                // Replace exact @/ paths
                const regexExact = new RegExp(`(['"])@/${oldP.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(['"])`, 'g');
                if (regexExact.test(content)) {
                    content = content.replace(regexExact, `$1@/${newP}$2`);
                    modified = true;
                }
                
                // Note: relative paths were mostly handled by ts-morph, but if ts-morph missed some, we might need to handle them.
                // However, ts-morph usually handles relative paths perfectly. It's the @/ aliases it doesn't know how to update.
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf-8');
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log("Imports fixed based on @/ alias mapping.");
