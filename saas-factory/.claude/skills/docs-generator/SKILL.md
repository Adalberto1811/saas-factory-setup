---
name: docs-generator
description: Use when user wants to write documentation, proposals, technical specs, or decision docs. Guide users through a structured 3-stage workflow for co-authoring documents with Context Gathering, Refinement & Structure, and Reader Testing. For tasks like "write a doc", "draft a proposal", "create a spec", or "write up" requests.
metadata:
  version: "1.0.0"
  author: "antigravity-skill-creator"
---

# Docs Generator

## Overview

Structured workflow for collaborative document creation. Act as an active guide through three stages: Context Gathering → Refinement & Structure → Reader Testing.

## When to Trigger

- User mentions: "write a doc", "draft a proposal", "create a spec", "write up"
- Doc types: PRD, design doc, decision doc, RFC, technical spec
- Substantial writing tasks requiring structure

## Workflow Stages

### 🎯 Stage 1: Context Gathering

**Goal**: Close the knowledge gap between user and assistant.

1. **Initial Questions** (ask all 5):
   - What type of document?
   - Who's the primary audience?
   - What's the desired impact?
   - Is there a template?
   - Any constraints?

2. **Info Dumping**: Encourage user to dump all context
   - Background, discussions, alternatives, constraints
   - "Don't worry about organizing - just get it all out"

3. **Clarifying Questions**: Generate 5-10 numbered questions based on gaps

4. **Exit Condition**: When edge cases can be discussed without explaining basics

---

### 🎯 Stage 2: Refinement & Structure

**Goal**: Build document section by section.

**For each section**:
1. **Clarify**: Ask 5-10 questions about what to include
2. **Brainstorm**: Generate 5-20 numbered options
3. **Curate**: User indicates keep/remove/combine
4. **Gap Check**: Ask if anything important is missing
5. **Draft**: Use `str_replace` to write section
6. **Refine**: Iterate based on feedback

**Quality Checks**:
- After 3 iterations with no changes → ask what can be removed
- At 80% completion → check flow, consistency, redundancy

---

### 🎯 Stage 3: Reader Testing

**Goal**: Verify document works for readers without context.

1. **Predict Questions**: Generate 5-10 reader questions
2. **Test**: Use sub-agent (no context bleed) to answer questions
3. **Check**: Look for ambiguity, false assumptions, contradictions
4. **Fix**: Loop back to Stage 2 for problematic sections

**Exit Condition**: Reader Claude consistently answers correctly

---

## Quick Reference

| Stage | Goal | Key Output |
|:------|:-----|:-----------|
| 1. Context | Close knowledge gap | 5-10 clarifying questions |
| 2. Refine | Section-by-section build | Drafted document |
| 3. Test | Verify for readers | Passed reader test |
