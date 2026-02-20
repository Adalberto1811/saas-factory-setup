const fs = require('fs');
const path = require('path');

/**
 * Loads the master prompt from a text file.
 * @returns {string} The content of the COACH_MASTER_PROMPT.txt file.
 */
function loadMasterPrompt() {
    const promptPath = path.join(__dirname, '..', 'prompts', 'COACH_MASTER_PROMPT.txt');
    try {
        const content = fs.readFileSync(promptPath, 'utf8');
        return content;
    } catch (error) {
        console.error('Error loading COACH_MASTER_PROMPT.txt:', error.message);
        return '';
    }
}

/**
 * Counts the number of words in a string.
 * @param {string} text - The text to count words from.
 * @returns {number} The word count.
 */
function getWordCount(text) {
    if (!text || text.trim().length === 0) return 0;
    // Split by whitespace and filter out empty strings
    return text.trim().split(/\s+/).length;
}

module.exports = {
    loadMasterPrompt,
    getWordCount
};
