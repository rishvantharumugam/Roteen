const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Query Supabase schema information using RPC or system views
  const { data, error } = await supabase.from('subjects').select('id').limit(1);
  console.log('Testing connection:');
  console.log(JSON.stringify({ data, error }, null, 2));

  console.log('Querying table names via RPC or postgres system catalog:');
  const res = await supabase.rpc('get_tables'); // Check if a helper function exists
  console.log(JSON.stringify(res, null, 2));
}

run();
