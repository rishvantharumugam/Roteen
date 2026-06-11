const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const Users_ID = '46898cdf-5efd-41dd-b04b-0de8f268090f';
  const Questions_ID = '9a4d6f2b-3c1e-4b8a-8f7d-5e2c9a1b6d40';
  const videos_id = '38646890-6fdb-48fd-8145-7b33132671e0';
  
  const now = new Date().toISOString();
  
  // 1. Insert a Resolved row
  const { data: insertData, error: insertError } = await supabase
    .from('user_questions_progress')
    .insert({
      Users_ID,
      Questions_ID,
      videos_id,
      status: 'Resolved',
      created_at: now,
      updated_at: now,
      completed_at: now
    })
    .select();
    
  console.log("Inserted Resolved row:", insertData);
  if (insertError) {
    console.error("Insert Error:", insertError);
    return;
  }
  
  const recordId = insertData[0].ID;
  
  // 2. Try to update status back to In_Progress and completed_at to null
  const { data: updateData, error: updateError } = await supabase
    .from('user_questions_progress')
    .update({
      status: 'In_Progress',
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('ID', recordId)
    .select();
    
  console.log("Updated row (should be In_Progress):", updateData);
  if (updateError) {
    console.error("Update Error:", updateError);
  }
}

test();
