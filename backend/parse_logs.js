const fs = require('fs');
const readline = require('readline');

async function parseLogs() {
  const fileStream = fs.createReadStream('C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\654ab2cf-3581-45fe-8246-de6ee677df2b\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      if (step.step_index >= 419 && step.step_index < 457) {
        if (step.source === 'MODEL' && step.type === 'PLANNER_RESPONSE') {
          console.log(`\n--- STEP ${step.step_index} ---`);
          console.log(`[MODEL]: ${step.content}`);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

parseLogs();
