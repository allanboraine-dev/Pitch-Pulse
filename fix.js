const fs = require('fs');
const files = [
  'src/app/live/page.tsx', 
  'src/app/manager/dashboard/page.tsx', 
  'src/components/scoring/ScorerDashboard.tsx', 
  'src/app/directory/page.tsx', 
  'src/components/live/LiveScorecard.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/className="min-h-screen bg-gray-950/g, 'className="min-h-screen bg-transparent');
    fs.writeFileSync(f, c);
    console.log('Fixed ' + f);
  }
});
