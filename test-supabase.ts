import { createClient } from '@supabase/supabase-js';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;
loadEnvConfig('./');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('subjects').select('subject_name');
  if (error) {
    console.error("Error fetching subjects:", error);
  } else {
    console.log("Full subjects list from database:", data);
  }
}

test();






