

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
  const { data: questions, error } = await supabase
    .from('questions')
    .select('questions_sections')
    .not('questions_sections', 'is', null)
    .limit(300);

  if (error) {
    console.error(error);
    return;
  }

  const uniqueVals = new Set();
  questions.forEach(q => {
    if (q.questions_sections) {
      uniqueVals.add(q.questions_sections.trim());
    }
  });

  console.log("Unique questions_sections (sample of 300 non-null):", Array.from(uniqueVals));
}

run();
