/* eslint-disable @typescript-eslint/no-require-imports */`nconst { createClient } = require('@supabase/supabase-js');
/* eslint-disable @typescript-eslint/no-require-imports */`nconst fs = require('fs');
/* eslint-disable @typescript-eslint/no-require-imports */`nconst envFile = fs.readFileSync('.env.local', 'utf8');
/* eslint-disable @typescript-eslint/no-require-imports */`nconst env = {};
/* eslint-disable @typescript-eslint/no-require-imports */`nenvFile.split('\n').forEach(line => {
/* eslint-disable @typescript-eslint/no-require-imports */`n  const match = line.match(/^([^=]+)=(.*)$/);
/* eslint-disable @typescript-eslint/no-require-imports */`n  if (match) env[match[1]] = match[2].replace(/["']/g, '');
/* eslint-disable @typescript-eslint/no-require-imports */`n});
/* eslint-disable @typescript-eslint/no-require-imports */`n
/* eslint-disable @typescript-eslint/no-require-imports */`nconst supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
/* eslint-disable @typescript-eslint/no-require-imports */`n
/* eslint-disable @typescript-eslint/no-require-imports */`nasync function check() {
/* eslint-disable @typescript-eslint/no-require-imports */`n  const { data, error } = await supabase.from('admin_notes').select('*').limit(5);
/* eslint-disable @typescript-eslint/no-require-imports */`n  console.log("DATA:");
/* eslint-disable @typescript-eslint/no-require-imports */`n  console.log(JSON.stringify(data, null, 2));
/* eslint-disable @typescript-eslint/no-require-imports */`n  console.log("ERROR:", error);
/* eslint-disable @typescript-eslint/no-require-imports */`n}
/* eslint-disable @typescript-eslint/no-require-imports */`ncheck();
