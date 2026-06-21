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
  const geoId = '390031e9-0275-4955-b70b-95d7a76b6c71';
  
  // 1. Fetch chapters
  const { data: chapters, error: chErr } = await supabase
    .from('chapters')
    .select('id, chapter_no, name')
    .eq('subject_id', geoId);
    
  console.log(`Chapters fetched from DB: ${chapters?.length || 0}`);
  console.log(chapters);

  // 2. Fetch questions
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, chapter_id, mode, standard, questions_sections, question, level')
    .eq('subject_id', geoId);

  console.log(`\nQuestions fetched from DB: ${questions?.length || 0}`);
  if (questions && questions.length > 0) {
    console.log(`Unique chapter_ids referenced by questions:`, Array.from(new Set(questions.map(q => q.chapter_id))));
    console.log(`Example questions (first 5):`);
    console.log(questions.slice(0, 5));
  }
}

run();
