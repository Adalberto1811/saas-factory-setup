// Undercover Mode Logic - Anthropic Internal v0.2.29
// Detects public vs internal projects to hide model names
const INTERNAL_MODELS = ['opus-4.7-beta', 'set-4.8-preview', 'cairos-v1'];
const isUndercover = (projectPath) => !projectPath.includes('anthropic-internal');
