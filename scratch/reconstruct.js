const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:\\Users\\RISHVANTH A\\.gemini\\antigravity-ide\\brain\\ee7103c5-9188-4dc1-8892-9d3f37d5dd34\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let fileContents = [];
  for await (const line of rl) {
    const step = JSON.parse(line);
    // Find view_file tool output for ProgressPageUI.tsx or write_to_file tool calls
    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        if (call.name === 'default_api:multi_replace_file_content' && call.arguments.TargetFile && call.arguments.TargetFile.endsWith('ProgressPageUI.tsx')) {
          fileContents.push({
            step: step.step_index,
            type: 'multi_replace_file_content',
            chunks: call.arguments.ReplacementChunks
          });
        }
        if (call.name === 'default_api:replace_file_content' && call.arguments.TargetFile && call.arguments.TargetFile.endsWith('ProgressPageUI.tsx')) {
          fileContents.push({
            step: step.step_index,
            type: 'replace_file_content',
            chunk: call.arguments
          });
        }
      }
    }
  }
  
  console.log('Found replacements in steps:', fileContents.map(f => ({ step: f.step, type: f.type })));
}
run();
