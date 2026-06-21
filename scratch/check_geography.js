const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Get Geography subject
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('*')
    .ilike('subject_name', '%geography%');

  if (subjErr) {
    console.error("Error fetching subjects:", subjErr);
    return;
  }

  console.log("Subjects found:");
  console.log(subjects);

  if (subjects.length === 0) {
    console.log("No geography subject found");
    return;
  }

  const geo = subjects[0];
  console.log(`Using Geography subject ID: ${geo.id}, Standard: ${geo.standard}`);

  // 2. Get questions for this subject in standard 10
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question, mode, standard, level, questions_sections, chapter_id')
    .eq('subject_id', geo.id);

  if (qErr) {
    console.error("Error fetching questions:", qErr);
    return;
  }

  console.log(`Total questions for Geography subject in database: ${questions.length}`);
  
  // Group by standard and mode
  const summary = {};
  questions.forEach(q => {
    const key = `Std: ${q.standard} | Mode: ${q.mode}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  console.log("\nQuestions count by standard and mode:");
  console.log(summary);

  // Print first 5 questions for standard 10
  const std10Questions = questions.filter(q => String(q.standard).trim() === '10' || String(q.standard).trim() === '10th');
  console.log(`\nStandard 10/10th questions count: ${std10Questions.length}`);
  console.log("\nFirst 10 questions for Std 10/10th:");
  console.log(std10Questions.slice(0, 10));
}

run();
