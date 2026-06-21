const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Helper to recursively find files in a directory
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getFiles(srcDir);

// Path resolution helpers
function resolveImportPath(currentFileDir, importPath) {
  let resolved = null;
  if (importPath.startsWith('@/')) {
    resolved = path.join(srcDir, importPath.slice(2));
  } else if (importPath.startsWith('.')) {
    // Relative path within project
    resolved = path.resolve(currentFileDir, importPath);
  } else {
    // External module (dependency)
    return { type: 'dependency', path: importPath };
  }

  // Try different extensions
  const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.css', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
  for (const ext of extensions) {
    const target = resolved + ext;
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      return { type: 'file', path: path.normalize(target) };
    }
  }

  return { type: 'unknown', path: resolved || importPath };
}

// Simple regex parser for imports
function parseImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Strip block comments and single line comments to avoid false matches
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const imports = new Set();
  const dependencies = new Set();
  const fileDir = path.dirname(filePath);

  // Regexes
  // import ... from "path"
  // import "path"
  // export ... from "path"
  // require("path")
  // import("path")
  const importRegexes = [
    /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\(['"]([^'"]+)['"]\)/g,
    /require\(['"]([^'"]+)['"]\)/g
  ];

  for (const regex of importRegexes) {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(cleanContent)) !== null) {
      const imp = match[1];
      const res = resolveImportPath(fileDir, imp);
      if (res.type === 'file') {
        imports.add(res.path);
      } else if (res.type === 'dependency') {
        dependencies.add(res.path);
      }
    }
  }

  return {
    imports: Array.from(imports),
    dependencies: Array.from(dependencies)
  };
}

// Build dependency graph
const graph = {};
const fileDependencies = {};

allFiles.forEach(file => {
  const normFile = path.normalize(file);
  const ext = path.extname(normFile);
  if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(ext)) {
    const { imports, dependencies } = parseImports(normFile);
    graph[normFile] = imports;
    fileDependencies[normFile] = dependencies;
  } else {
    graph[normFile] = [];
    fileDependencies[normFile] = [];
  }
});

// Find entry points
const entryPoints = allFiles.filter(file => {
  const norm = path.normalize(file);
  const relative = path.relative(srcDir, norm).replace(/\\/g, '/');
  
  // App router entry points
  return (
    relative.endsWith('/page.tsx') ||
    relative.endsWith('/route.ts') ||
    relative.endsWith('/layout.tsx') ||
    relative.endsWith('/template.tsx') ||
    relative.endsWith('/providers.tsx') ||
    relative.endsWith('/loading.tsx') ||
    relative === 'app/globals.css' ||
    relative === 'app/favicon.ico' ||
    relative === 'middleware.ts'
  );
}).map(f => path.normalize(f));

console.log(`Found ${entryPoints.length} entry points.`);

// BFS to find all reachable files
const visited = new Set(entryPoints);
const queue = [...entryPoints];

while (queue.length > 0) {
  const current = queue.shift();
  const imports = graph[current] || [];
  imports.forEach(imp => {
    if (!visited.has(imp)) {
      visited.add(imp);
      queue.push(imp);
    }
  });
}

// Unvisited files (orphaned files)
const orphanedFiles = allFiles.filter(file => !visited.has(path.normalize(file)));

console.log('\n--- ORPHANED SOURCE FILES ---');
console.log(`Found ${orphanedFiles.length} orphaned files out of ${allFiles.length} total files.`);
orphanedFiles.forEach(file => {
  console.log(path.relative(rootDir, file).replace(/\\/g, '/'));
});

// Analyze dependencies
const packageJsonPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const declaredDependencies = Object.keys(pkg.dependencies || {});

const usedDependencies = new Set();
visited.forEach(file => {
  const deps = fileDependencies[file] || [];
  deps.forEach(dep => {
    // Get the base package name (e.g. @supabase/ssr -> @supabase/ssr, lodash/map -> lodash)
    let baseName = dep;
    if (dep.startsWith('@')) {
      const parts = dep.split('/');
      baseName = parts.slice(0, 2).join('/');
    } else {
      baseName = dep.split('/')[0];
    }
    usedDependencies.add(baseName);
  });
});

console.log('\n--- UNUSED DEPENDENCIES ---');
const unusedDeps = declaredDependencies.filter(dep => !usedDependencies.has(dep));
unusedDeps.forEach(dep => {
  console.log(dep);
});
