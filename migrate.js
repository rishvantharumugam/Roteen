const { Project } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const features = [
    "auth", "dashboard", "session", "video", "notes", "revision", 
    "news", "profile", "notification", "tutorial", "feedback", "bug", "terms"
];

// Helper to find which feature a file belongs to based on path
function getFeature(filePath) {
    const lowerPath = filePath.toLowerCase();
    
    // First, check explicit directory matches like store/dashboardpage -> dashboard
    const match = lowerPath.match(/(store|ui|controller|service|navigation|styles|style)\/([^/]+)\//);
    if (match) {
        let feat = match[2];
        if (feat === "dashboardpage") return "dashboard";
        if (feat === "landingpage") return "landing"; // or public/shared? We'll put landingpage in features/auth or something, but wait, target doesn't have landing feature. Maybe components/landing?
        if (feat === "video" || feat === "videobookmark" || feat === "videosubject") return "video";
        if (feat === "profile.controller.ts" || feat === "profile.service.ts" || feat === "profile") return "profile";
        
        if (features.includes(feat)) return feat;
    }

    for (const feat of features) {
        if (lowerPath.includes(feat)) return feat;
    }
    
    if (lowerPath.includes("landing")) return "landing"; // We will handle landing specially
    return null;
}

const sourceFiles = project.getSourceFiles();

const moves = [];

for (const sourceFile of sourceFiles) {
    const originalPath = sourceFile.getFilePath();
    
    // Only process files in src/ but not in app/, lib/, providers/ (unless specified)
    if (!originalPath.includes("/src/")) continue;
    if (originalPath.includes("/src/app/")) continue;
    if (originalPath.includes("/src/lib/")) continue;
    if (originalPath.includes("/src/providers/")) continue;
    // skip this script if it's somehow included
    if (originalPath.includes("migrate")) continue;

    const relPath = originalPath.substring(originalPath.indexOf("/src/") + 5);
    const fileName = path.basename(relPath);
    let targetRelPath = null;
    
    const feature = getFeature(originalPath);
    
    let safeFileName = fileName;
    if (fileName === "index.ts" || fileName === "index.tsx") {
        const grandParentDir = path.basename(path.dirname(path.dirname(originalPath)));
        if (grandParentDir === "ui" || grandParentDir === "store") {
            safeFileName = `${grandParentDir}Index${path.extname(fileName)}`;
        }
    }
    
    // Controllers -> actions or services
    if (relPath.startsWith("controller/")) {
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/actions/${safeFileName}`;
        } else {
            targetRelPath = `actions/${safeFileName}`;
        }
    }
    // Services
    else if (relPath.startsWith("service/")) {
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/services/${safeFileName}`;
        } else {
            targetRelPath = `services/${safeFileName}`;
        }
    }
    // Store & UI -> components
    else if (relPath.startsWith("store/") || relPath.startsWith("ui/")) {
        const isLayout = safeFileName.includes("Header") || safeFileName.includes("Navbar") || safeFileName.includes("Sidebar") || safeFileName.includes("Footer");
        const isShared = safeFileName.includes("EmptyState") || safeFileName.includes("ErrorModal") || safeFileName.includes("LoadingSkeleton") || relPath.includes("shared");
        
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/components/${safeFileName}`;
        } else {
            if (isLayout) targetRelPath = `components/layout/${safeFileName}`;
            else if (isShared) targetRelPath = `components/shared/${safeFileName}`;
            else targetRelPath = `components/ui/${safeFileName}`;
        }
    }
    // Navigation -> constants
    else if (relPath.startsWith("navigation/")) {
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/constants/${safeFileName}`;
        } else {
            targetRelPath = `constants/${safeFileName}`;
        }
    }
    // Styles -> components (we keep them with their component)
    else if (relPath.startsWith("styles/") || relPath.startsWith("style/")) {
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/components/${safeFileName}`;
        } else {
            targetRelPath = `components/shared/${safeFileName}`;
        }
    }
    // Top-level src/ files (like feedback.ts, terms.ts)
    else if (!relPath.includes("/")) {
        if (feature) {
            targetRelPath = `features/${feature === 'landing' ? 'auth' : feature}/types/${safeFileName}`;
        } else {
            targetRelPath = `types/${safeFileName}`;
        }
    }

    if (targetRelPath) {
        const targetAbsPath = path.resolve(project.compilerOptions.get().rootDir || process.cwd(), "src", targetRelPath);
        moves.push({ file: sourceFile, target: targetAbsPath, original: originalPath, targetRel: targetRelPath });
    }
}

console.log(`Found ${moves.length} files to move.`);
fs.writeFileSync("moves.json", JSON.stringify(moves.map(m => ({from: m.original, to: m.targetRel})), null, 2));

// Execute moves
for (const move of moves) {
    // console.log(`Moving ${move.original} to ${move.target}`);
    move.file.move(move.target);
}

// Save project (this applies the moves and updates imports)
project.save().then(() => {
    console.log("Migration complete.");
}).catch(err => {
    console.error("Error saving project:", err);
});
