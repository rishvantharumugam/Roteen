const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: questions } = await supabase
    .from('questions')
    .select('id, subject_id, subjects(subject_name, standard)');

  const countsBySubject = {};
  questions.forEach(q => {
    const sub = q.subjects;
    if (sub && sub.standard === '10') {
      const name = sub.subject_name;
      countsBySubject[name] = (countsBySubject[name] || 0) + 1;
    }
  });

  console.log('Total questions in standard 10 by subject in DB:');
  console.log(countsBySubject);
}

run();
