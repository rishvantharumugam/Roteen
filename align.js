const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Move folders in app/
const moves = [
    ['app/dashboardpage', 'app/dashboard'],
    ['app/sign-up', 'app/signup'],
    ['app/notes/revision', 'app/revision']
];

for (const [from, to] of moves) {
    const fromPath = path.join(srcDir, from);
    const toPath = path.join(srcDir, to);
    if (fs.existsSync(fromPath)) {
        if (!fs.existsSync(path.dirname(toPath))) {
            fs.mkdirSync(path.dirname(toPath), { recursive: true });
        }
        fs.renameSync(fromPath, toPath);
        console.log(`Moved ${from} to ${to}`);
    }
}

// Handle landingpage and notifications
const landingPageDir = path.join(srcDir, 'app/landingpage');
if (fs.existsSync(landingPageDir)) {
    const landingPageContent = fs.readFileSync(path.join(landingPageDir, 'page.tsx'), 'utf8');
    fs.writeFileSync(path.join(srcDir, 'app/page.tsx'), landingPageContent);
    fs.rmSync(landingPageDir, { recursive: true, force: true });
    console.log('Moved landingpage/page.tsx to page.tsx and deleted landingpage folder');
}

const notificationsDir = path.join(srcDir, 'app/notifications');
if (fs.existsSync(notificationsDir)) {
    fs.rmSync(notificationsDir, { recursive: true, force: true });
    console.log('Deleted duplicate app/notifications');
}

// 2. Lib Organization
const libDir = path.join(srcDir, 'lib');
const supabaseDir = path.join(libDir, 'supabase');
if (!fs.existsSync(supabaseDir)) fs.mkdirSync(supabaseDir);

if (fs.existsSync(path.join(libDir, 'supabaseClient.ts'))) {
    fs.renameSync(path.join(libDir, 'supabaseClient.ts'), path.join(supabaseDir, 'client.ts'));
    console.log('Moved supabaseClient.ts to supabase/client.ts');
} else if (fs.existsSync(path.join(libDir, 'supabase.ts'))) {
    fs.renameSync(path.join(libDir, 'supabase.ts'), path.join(supabaseDir, 'client.ts'));
    console.log('Moved supabase.ts to supabase/client.ts');
}

if (fs.existsSync(path.join(libDir, 'supabase-server.ts'))) {
    fs.renameSync(path.join(libDir, 'supabase-server.ts'), path.join(supabaseDir, 'server.ts'));
    console.log('Moved supabase-server.ts to supabase/server.ts');
}

// Handle middleware.ts inside lib? The target has `lib/supabase/middleware.ts`. The current has `src/lib/supabase-proxy.ts`? Or `middleware.ts` at the root?
// "lib/supabase/middleware.ts". I'll check if there's a file I should move.
if (fs.existsSync(path.join(__dirname, 'middleware.ts'))) {
    // Keep it at root if Next.js needs it there. The target says `middleware.ts` at the root, AND `lib/supabase/middleware.ts`.
    // If I don't have lib/supabase/middleware.ts, I just won't create it.
}

// 3. Create index.tsx in all features
const featuresDir = path.join(srcDir, 'features');
if (fs.existsSync(featuresDir)) {
    const features = fs.readdirSync(featuresDir);
    for (const feature of features) {
        const featureDir = path.join(featuresDir, feature);
        if (fs.statSync(featureDir).isDirectory()) {
            const indexPath = path.join(featureDir, 'index.tsx');
            if (!fs.existsSync(indexPath)) {
                fs.writeFileSync(indexPath, '// Export feature components and services here\n');
                console.log(`Created index.tsx for feature: ${feature}`);
            }
        }
    }
}
