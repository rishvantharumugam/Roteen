import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';
loadEnvConfig('./');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('users').select('id, name').ilike('name', '%Rishvanth%').limit(1);
  console.log("Data:", data);
}

test();






