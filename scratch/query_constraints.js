const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const query = `
    SELECT conname, pg_get_constraintdef(c.oid) 
    FROM pg_constraint c 
    JOIN pg_namespace n ON n.oid = c.connamespace 
    WHERE conrelid = 'public.user_questions_progress'::regclass;
  `;
  
  const { data, error } = await supabase.rpc('run_sql', { sql: query }); // Check if run_sql is available
  console.log("RPC run_sql Result:", { data, error });
  
  // Alternative direct fetch: just query the table and inspect error details or check if we can query pg_catalog
  if (error) {
    // If run_sql is not defined, we can check pg_catalog using standard select (some schemas allow select on pg_catalog)
    const res = await supabase.from('pg_constraint').select('*');
    console.log("pg_constraint:", res);
  }
}

test();
