const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('user_questions_progress').select('*').limit(5);
  console.log('user_questions_progress sample:');
  console.log(JSON.stringify(data, null, 2));

  // Count by status
  const { data: countData } = await supabase.from('user_questions_progress').select('status');
  const counts = {};
  countData.forEach(row => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });
  console.log('Status counts:', counts);
}

run();
