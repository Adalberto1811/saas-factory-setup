---
name: agent-browser
description: "Control a browser via CLI for efficient web automation and research."
---

# Vercel Agent Browser

## Overview
Based on `agent-browser` from Vercel Labs, this skill allows the agent to control a browser using a snapshot-based approach that minimizes token consumption.

## When to Use
- When Playwright MCP is too heavy or token-expensive.
- For quick data extraction or form filling.
- When you need a compact view of the page with @references.

## Instructions
1. **Initialize**: Ensure `agent-browser` is installed (`npm install -g agent-browser`).
2. **Open**: Use `agent-browser open <url>` to start.
3. **Scan**: Run `agent-browser snapshot -i` to get interactive element references (@e1, @e2, etc.).
4. **Interact**: 
   - Click: `agent-browser click @e<number>`
   - Fill: `agent-browser fill @e<number> "text"`
   - Type: `agent-browser type @e<number> "text"`
5. **Observe**: Review the terminal output for text content or status.

## Examples
```bash
# Research a competitor
agent-browser open https://competitor.com
agent-browser snapshot -i
agent-browser click @e3
```

## Best Practices
- Always re-snapshot after a navigation or a major DOM change.
- Use semantic find if @references fail: `agent-browser find text "Submit" click`.
- Keep the reasoning loop tight: Snapshot -> Decide -> Act.
