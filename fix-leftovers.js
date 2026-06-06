const fs = require('fs');
const path = require('path');

const leftovers = {
  "videoStyles.navItemActive": `"rounded-full border border-purple-400/35 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-1.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]"`,
  "videoStyles.navItem": `"rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100"`,
  "videoStyles.activeTab": `"border-b-2 border-purple-500 text-purple-400"`,
  "videoStyles.inactiveTab": `"border-b-2 border-transparent text-zinc-300"`,
  "termsStyles.primaryButton": `"flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7C3AED]"`,
  "termsStyles.button": `"flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10"`,
  "tutorialStyles.primaryButton": `"flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(124,58,237,0.4)] disabled:opacity-50"`,
  "tutorialStyles.button": `"flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"`,
  "tutorialStyles.subtlePanel": `"rounded-2xl border border-white/5 bg-white/5 shadow-sm"`,
  "revisionStyles.pinIconActive": `"w-4 h-4 text-[#A98CFA] cursor-pointer drop-shadow-[0_0_8px_rgba(169,140,250,0.5)]"`,
  "sessionStyles.activeCardTagLive": `"rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/30"`,
  "sessionStyles.activeCardTagCompleted": `"rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30"`,
  "sessionStyles.activeCardTagUpcoming": `"rounded bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-400 border border-violet-500/30"`,
  "sessionStyles.actionEnroll": `"w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"`,
  "sessionStyles.actionFinished": `"w-full rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"`,
  "sessionStyles.actionJoinLive": `"w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"`,
  "sessionStyles.actionJoin": `"w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"`,
  "sessionStyles.topNavItemPrimary": `"rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"`,
  "sessionStyles.topNavItem": `"rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"`,
  "notificationsStyles.container": `"w-full max-w-2xl mx-auto space-y-4"`,
  "notificationsStyles.primaryButton": `"flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(124,58,237,0.4)] disabled:opacity-50"`,
  "notificationsStyles.button": `"flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"`,
  "noteStyles.editorPinButtonActive": `"text-[#A98CFA] drop-shadow-[0_0_8px_rgba(169,140,250,0.5)]"`,
  "noteStyles.editorPinButton": `"text-gray-400 hover:text-white transition-colors"`
};

function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        findFiles(filePath, ext, fileList);
      }
    } else if (filePath.endsWith(ext)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const tsxFiles = findFiles(path.join(__dirname, 'src'), '.tsx');

for (const tsxFile of tsxFiles) {
  let content = fs.readFileSync(tsxFile, 'utf8');
  let originalContent = content;

  for (const [key, val] of Object.entries(leftovers)) {
    // We do global string replace for the key
    content = content.split(key).join(val);
  }

  if (content !== originalContent) {
    fs.writeFileSync(tsxFile, content, 'utf8');
    console.log(`Fixed leftovers in: ${tsxFile}`);
  }
}
