const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const Users_ID = '46898cdf-5efd-41dd-b04b-0de8f268090f';
  const Questions_ID = '9a4d6f2b-3c1e-4b8a-8f7d-5e2c9a1b6d40';
  const videos_id = '38646890-6fdb-48fd-8145-7b33132671e0';
  
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('user_questions_progress')
    .upsert({
      Users_ID,
      Questions_ID,
      videos_id,
      status: 'In_Progress',
      updated_at: now
    }, {
      onConflict: 'Users_ID,Questions_ID,videos_id'
    });
    
  console.log("Upsert Result:", { data, error });
}

test();
