const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Sample from questions
  const { data: qData, error: qError } = await supabase.from('questions').select('*').limit(3);
  console.log('questions sample:', JSON.stringify(qData, null, 2), 'error:', qError?.message);

  // Sample from user_questions_progress
  const { data: uqpData, error: uqpError } = await supabase.from('user_questions_progress').select('*').limit(5);
  console.log('user_questions_progress sample:', JSON.stringify(uqpData, null, 2), 'error:', uqpError?.message);

  // Total questions count
  const { count: totalQ, error: totalQError } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log('Total questions:', totalQ, 'error:', totalQError?.message);

  // Total subjects
  const { count: totalS, error: totalSError } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
  console.log('Total subjects:', totalS, 'error:', totalSError?.message);
}

run();
