/**
 * Script to add fixed header pattern to all onboarding steps
 * This replaces sticky headers with fixed headers that hide when footer is visible
 */

const fs = require('fs');
const path = require('path');

const onboardingDir = path.join(__dirname, '../src/pages/onboarding');

// Help icon component to add if missing
const helpIconComponent = `
// Help icon
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);`;

// Fixed header pattern
const getFixedHeaderPattern = (backHandler) => `
        {/* Fixed Header - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <header className="fixed top-0 z-20 w-full max-w-[500px] flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]" data-onboarding-header>
            <button 
              onClick={${backHandler}}
              aria-label="Go back"
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
            >
              <BackIcon />
            </button>
            <button 
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
              aria-label="Help"
            >
              <HelpIcon />
            </button>
          </header>
        )}
        
        {/* Spacer for fixed header */}
        <div className="h-16" />`;

// Files to process (Step3 to Step15, MeetCeo, VerifyIdentity, VerifyComplete)
const files = [
  'Step3.tsx',
  'Step4.tsx', 
  'Step5.tsx',
  'Step6.tsx',
  'Step7.tsx',
  'Step8.tsx',
  'Step9.tsx',
  'Step10.tsx',
  'Step11.tsx',
  'Step12.tsx',
  'Step13.tsx',
  'Step14.tsx',
  'Step15.tsx',
  'MeetCeo.tsx',
  'VerifyIdentity.tsx',
  'VerifyComplete.tsx'
];

let updatedCount = 0;
let skippedCount = 0;

files.forEach(filename => {
  const filepath = path.join(onboardingDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`Skipped: ${filename} (file not found)`);
    skippedCount++;
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');
  let modified = false;
  
  // Check if already has fixed header pattern
  if (content.includes('data-onboarding-header')) {
    console.log(`Already updated: ${filename}`);
    skippedCount++;
    return;
  }
  
  // Add HelpIcon if missing
  if (!content.includes('const HelpIcon')) {
    // Find BackIcon and add HelpIcon after it
    const backIconMatch = content.match(/const BackIcon = \(\) => \([\s\S]*?\);/);
    if (backIconMatch) {
      content = content.replace(backIconMatch[0], backIconMatch[0] + helpIconComponent);
      modified = true;
    }
  }
  
  // Check if useFooterVisibility is imported
  if (!content.includes('useFooterVisibility')) {
    // Add import
    const importMatch = content.match(/import.*from '\.\.\/\.\.\/resources\/config\/config';/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + "\nimport { useFooterVisibility } from '../../utils/useFooterVisibility';"
      );
      modified = true;
    }
    
    // Add hook usage after navigate declaration
    const navigateMatch = content.match(/const navigate = useNavigate\(\);/);
    if (navigateMatch) {
      // Check if isFooterVisible is already declared
      if (!content.includes('const isFooterVisible')) {
        // Find where to add the hook (after state declarations typically)
        const hookAddPoint = content.match(/const \[.*?\] = useState.*?;[\s\S]*?(?=\n\s*useEffect|\n\s*const handle)/);
        if (hookAddPoint) {
          content = content.replace(
            hookAddPoint[0],
            hookAddPoint[0] + '\n  const isFooterVisible = useFooterVisibility();'
          );
          modified = true;
        }
      }
    }
  }
  
  // Replace sticky header with fixed header pattern
  // Pattern 1: Sticky Header with just back button
  const stickyPattern1 = /\{\/\* Sticky Header \*\/\}\s*<header className="[^"]*sticky[^"]*"[^>]*>[\s\S]*?<\/header>/;
  // Pattern 2: Header with various configurations
  const stickyPattern2 = /<header className="[^"]*sticky top-0[^"]*"[^>]*>[\s\S]*?<\/header>/;
  
  // Find back handler function name
  let backHandler = 'handleBack';
  if (content.includes('onClick={() => navigate(-1)}')) {
    backHandler = '() => navigate(-1)';
  } else if (content.includes('onClick={handleBack}')) {
    backHandler = 'handleBack';
  }
  
  const newHeader = getFixedHeaderPattern(backHandler);
  
  if (stickyPattern1.test(content)) {
    content = content.replace(stickyPattern1, newHeader.trim());
    modified = true;
  } else if (stickyPattern2.test(content)) {
    content = content.replace(stickyPattern2, newHeader.trim());
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated: ${filename}`);
    updatedCount++;
  } else {
    console.log(`No changes needed: ${filename}`);
    skippedCount++;
  }
});

console.log(`\nSummary: ${updatedCount} files updated, ${skippedCount} files skipped`);
