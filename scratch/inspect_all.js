const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const subjects = await supabase.from('subjects').select('*');
  const quizzes = await supabase.from('quizzes').select('*');
  const progress = await supabase.from('user_quiz_progress').select('*');
  const questions = await supabase.from('quiz_questions').select('*');
  
  console.log('Subjects:', JSON.stringify(subjects.data, null, 2));
  console.log('Quizzes:', JSON.stringify(quizzes.data, null, 2));
  console.log('Progress:', JSON.stringify(progress.data, null, 2));
  console.log('Questions:', JSON.stringify(questions.data, null, 2));
}

run();
