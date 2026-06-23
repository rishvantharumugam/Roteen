const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let GITHUB_TOKEN = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'GITHUB_TOKEN' || key === 'GITHUB_PAT' || key === 'NOTES_GITHUB_TOKEN') {
        GITHUB_TOKEN = val;
      }
    }
  }
}

const supabaseUrl = 'https://lzyvqqmwjjtveavxndev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('GitHub Token present:', !!GITHUB_TOKEN);

  console.log('Counting admin_notes...');
  const { count, error: countErr } = await supabase.from('admin_notes').select('*', { count: 'exact', head: true });
  console.log(`Total admin_notes rows: ${count}, error: ${countErr?.message}`);

  console.log('Fetching a sample note from admin_notes...');
  const startDb = Date.now();
  const { data, error } = await supabase
    .from('admin_notes')
    .select('question_id, note_url, path, answer_type, Mode_type')
    .limit(1);
  console.log(`Database query finished in ${Date.now() - startDb}ms`);

  if (error || !data || data.length === 0) return;

  const row = data[0];
  const cleanNoteUrl = row.note_url?.trim().replace(/[\r\n]+/g, "") ?? "";
  const cleanPath = row.path?.trim().replace(/\\/g, "/").replace(/^\/+/, "");

  // URL decoding helper
  function decodeUrlPath(val) {
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  }

  function githubRefFromUrl(value) {
    try {
      const url = new URL(value);
      const decodedPath = decodeUrlPath(url.pathname);
      const segments = decodedPath.split("/").filter(Boolean);
      if (url.hostname === "github.com") {
        const [owner, repo, marker, branch, ...rest] = segments;
        if (!owner || !repo || !branch || !["blob", "tree"].includes(marker)) return null;
        return { owner, repo, branch, filePath: rest.join("/") };
      }
      if (url.hostname === "raw.githubusercontent.com") {
        const [owner, repo, branch, ...rest] = segments;
        if (!owner || !repo || !branch) return null;
        return { owner, repo, branch, filePath: rest.join("/") };
      }
    } catch {
      return null;
    }
    return null;
  }

  const baseRef = githubRefFromUrl(cleanNoteUrl);
  if (!baseRef) return;

  // Let's implement the correct path combine logic with decoded endsWith
  let fileRef;
  if (baseRef.filePath && baseRef.filePath.endsWith(cleanPath)) {
    fileRef = baseRef;
  } else {
    const baseDirectory = baseRef.filePath ? baseRef.filePath.slice(0, baseRef.filePath.lastIndexOf("/") + 1) : "";
    const filePath = `${baseDirectory}${cleanPath}`.replace(/^\/+/, "");
    fileRef = {
      ...baseRef,
      filePath,
    };
  }
  fileRef.publicUrl = `https://github.com/${fileRef.owner}/${fileRef.repo}/blob/${fileRef.branch}/${fileRef.filePath}`;

  console.log('Correctly parsed fileRef:', fileRef);

  // Measure GitHub API fetch
  const apiUrl = `https://api.github.com/repos/${fileRef.owner}/${fileRef.repo}/contents/${fileRef.filePath}?ref=${encodeURIComponent(fileRef.branch)}`;
  console.log('Testing GitHub API fetch...');
  const startApi = Date.now();
  const apiRes = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
    }
  });
  const apiTime = Date.now() - startApi;
  console.log(`GitHub API fetch took: ${apiTime}ms. Status: ${apiRes.status}`);

  // Measure raw.githubusercontent.com fetch
  const rawUrl = `https://raw.githubusercontent.com/${fileRef.owner}/${fileRef.repo}/${fileRef.branch}/${fileRef.filePath}`;
  console.log('Testing direct raw.githubusercontent.com fetch...');
  const startRaw = Date.now();
  const rawRes = await fetch(rawUrl, {
    headers: {
      ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {})
    }
  });
  const rawTime = Date.now() - startRaw;
  console.log(`Raw URL fetch took: ${rawTime}ms. Status: ${rawRes.status}`);
  if (rawRes.ok) {
    const text = await rawRes.text();
    console.log(`Success! Response length: ${text.length}`);
  } else {
    console.log(`Failed! Status: ${rawRes.status}`);
  }
}

run();
