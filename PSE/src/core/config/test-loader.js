const { loadMasterPrompt, getWordCount } = require('./promptLoader');
const fs = require('fs');
const path = require('path');

// Test probe
const testContent = "Performance Swimming Evolution is the best SaaS for Olympic swimmers.";
const testFilePath = path.join(__dirname, '..', 'prompts', 'COACH_MASTER_PROMPT.txt');

// 1. Write dummy content
fs.writeFileSync(testFilePath, testContent, 'utf8');

// 2. Load it back
const loadedContent = loadMasterPrompt();
const wordCount = getWordCount(loadedContent);

console.log('--- PSE LOADER TEST ---');
console.log('Loaded Content:', loadedContent);
console.log('Word Count:', wordCount);

if (wordCount === 10) {
    console.log('SUCCESS: Word count is accurate (10 words).');
} else {
    console.log('FAILURE: Word count mismatch.');
}
