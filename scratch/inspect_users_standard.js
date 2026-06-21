const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Inspect users table
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(3);
  console.log('users table sample:');
  console.log(JSON.stringify({ data: users, error: usersError }, null, 2));

  // Check subjects with standard field
  const { data: subjects, error: subjectsError } = await supabase.from('subjects').select('*').limit(5);
  console.log('\nsubjects table sample:');
  console.log(JSON.stringify({ data: subjects, error: subjectsError }, null, 2));

  // Check quizzes with standard field
  const { data: quizzes, error: quizzesError } = await supabase.from('quizzes').select('*').limit(3);
  console.log('\nquizzes table sample:');
  console.log(JSON.stringify({ data: quizzes, error: quizzesError }, null, 2));

  // Check questions by standard  
  const { data: questions10, error: q10Error } = await supabase.from('questions').select('id, standard, subject_id').eq('standard', '10').limit(5);
  console.log('\nquestions where standard=10:');
  console.log(JSON.stringify({ data: questions10, error: q10Error }, null, 2));

  // All distinct standards in questions
  const { data: allQ, error: allQErr } = await supabase.from('questions').select('standard');
  const standards = [...new Set((allQ || []).map(q => q.standard))];
  console.log('\nDistinct standards in questions:', standards);

  // All subjects - look for duplicates after normalization
  const { data: allSubjects } = await supabase.from('subjects').select('id, subject_name, standard');
  console.log('\nAll subjects:', JSON.stringify(allSubjects, null, 2));
}

run();
