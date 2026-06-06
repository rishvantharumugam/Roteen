const fs = require('fs');
const path = require('path');

const pageFiles = [
  'src/features/video/components/video.tsx',
  'src/features/auth/components/LandingPageUI.tsx',
  'src/features/dashboard/components/DashboardPageClientView.tsx',
  'src/features/dashboard/components/DashboardPageUI.tsx',
  'src/features/feedback/components/FeedbackPage.tsx',
  'src/features/news/components/NewsPage.tsx',
  'src/features/notes/components/NotesPageUI.tsx',
  'src/features/notification/components/NotificationsPage.tsx',
  'src/features/notification/components/NotificationsStore.tsx',
  'src/features/notification/components/LoadingSkeleton.tsx',
  'src/features/revision/components/RevisionPageUI.tsx',
  'src/features/session/components/SessionPageUI.tsx',
  'src/features/session/components/SessionVideoPageUI.tsx',
  'src/features/terms/components/TermsPage.tsx',
  'src/features/tutorial/components/TutorialPage.tsx',
  'src/features/bug/components/BugWorkspace.tsx',
  'src/features/bug/components/BugPageUI.tsx',
  'src/features/profile/components/ProfileContainer.tsx'
];

for (const relPath of pageFiles) {
  const filePath = path.join(__dirname, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Match className=something that ends with >
    // We assume className is the last attribute or the only one missing quotes that we care about here.
    // e.g. <main className=bg-black academy-landing-page min-h-screen !text-slate-950>
    // becomes <main className="bg-black academy-landing-page min-h-screen !text-slate-950">
    
    // We can use a regex to capture everything from `className=bg-black` up to the closing `>`
    content = content.replace(/className=(bg-black[^>]*?)>/g, 'className="$1">');
    
    // If there's an instance where className=bg-black is NOT the last attribute (ends with a space instead of >)
    // Actually, in JSX className is usually at the end, but let's be careful.
    // Let's just fix the specific cases we know. We saw they all end with `>`.

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed JSX in: ${filePath}`);
    }
  }
}
