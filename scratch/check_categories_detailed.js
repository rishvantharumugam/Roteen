const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: chapters, error: chErr } = await supabase
    .from('chapters')
    .select('id, name, chapter_no');
    
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, category, chapter_id, question');
    
  if (chErr || qErr) {
    console.error("Errors:", { chErr, qErr });
    return;
  }
  
  const chMap = new Map(chapters.map(c => [String(c.id), c]));
  
  const breakdown = {};
  
  questions.forEach(q => {
    const chId = String(q.chapter_id);
    const chapter = chMap.get(chId);
    const chName = chapter ? `CH${chapter.chapter_no}: ${chapter.name}` : `Unknown Chapter (${chId})`;
    const cat = q.category ? String(q.category).trim() : 'null/empty';
    
    if (!breakdown[chName]) {
      breakdown[chName] = {};
    }
    breakdown[chName][cat] = (breakdown[chName][cat] || 0) + 1;
  });
  
  console.log("Breakdown of questions per chapter and category:");
  console.log(JSON.stringify(breakdown, null, 2));
  
  console.log("Total questions fetched:", questions.length);
}

run();
