const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const stringReplacements = [
    // Next.js Link / Router changes
    { from: /\/dashboardpage/g, to: '/dashboard' },
    { from: /\/sign-up/g, to: '/signup' },
    { from: /\/landingpage/g, to: '/' },
    { from: /\/notes\/revision/g, to: '/revision' },
    { from: /"dashboardpage"/g, to: '"dashboard"' },
    { from: /"sign-up"/g, to: '"signup"' },
    { from: /"landingpage"/g, to: '"home"' }, // wait, landingpage is often mapped to 'home' id in route maps? "home": "/landingpage". The previous map was `{ home: "/landingpage", dashboard: "/dashboardpage", revision: "/notes/revision" }`. So I should just replace the values. Let's do string replacement.
    
    // Supabase file changes
    { from: /@\/lib\/supabaseClient/g, to: '@/lib/supabase/client' },
    { from: /@\/lib\/supabase-server/g, to: '@/lib/supabase/server' },
    { from: /@\/lib\/supabase/g, to: '@/lib/supabase/client' }, // wait, maybe don't do this blindly. Only if it matches exactly `@/lib/supabase`
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;

            // Route Replacements
            content = content.replace(/\/dashboardpage/g, '/dashboard');
            content = content.replace(/\/sign-up/g, '/signup');
            content = content.replace(/\/landingpage/g, '/');
            content = content.replace(/\/notes\/revision/g, '/revision');
            
            // Supabase Imports
            content = content.replace(/['"]@\/lib\/supabaseClient['"]/g, "'@/lib/supabase/client'");
            content = content.replace(/['"]@\/lib\/supabase-server['"]/g, "'@/lib/supabase/server'");
            // there was also a supabase.ts
            content = content.replace(/['"]@\/lib\/supabase['"]/g, "'@/lib/supabase/client'");

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                // console.log(`Updated strings in ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log("Updated URLs and Supabase imports");
