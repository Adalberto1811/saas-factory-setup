# 🧩 MCP Registry (Socio Boss Sensors)

This directory acts as the central hub for all Model Context Protocol (MCP) servers connected to the Open Gravity architecture. It provides the agent with persistent awareness of its sensory capabilities and external database access.

## Active Connections (as of 2026-03-07)

### 1. `InsForge-Cerebro` (Database & Business Logic)
- **Role:** Deep integration with the InsForge backend, Cerebro Antropométrico, and client data.
- **Access Level:** Read/Write
- **Dependency:** `@insforge/mcp`
- **Configuration:** Local `API_KEY` and `API_BASE_URL` injected directly into `mcp_config.json`.

### 2. `mcp-server-neon` (PostgreSQL Serverless)
- **Role:** Direct SQL execution access to the Neon databases bridging the SaaS Factory infrastructure.
- **Access Level:** Full SQL Access
- **Dependency:** `https://mcp.neon.tech/sse`

### 3. `github` (Source Control Audit)
- **Role:** Allows Socio Boss to read branches, commits, PRs, and issues directly from the master repository to ensure synchronized alignment with the human developer.
- **Access Level:** Read
- **Dependency:** `@modelcontextprotocol/server-github`

### 4. `Snyk` (Cybersecurity Shield)
- **Role:** Pre-commit local code scanning to ensure zero vulnerabilities enter the `main` branch before being pushed to Vercel/InsForge.
- **Access Level:** Audit Only
- **Dependency:** Local CLI execution

### 5. `sequential-thinking` (Reasoning Loop)
- **Role:** Internal logic processor to break down complex architectural problems (e.g. debugging N8N, PWA caching) into step-by-step verifiable sub-tasks.
- **Access Level:** Internal Logic

---
*Note: Edits to `~/.gemini/antigravity/mcp_config.json` must be manually reflected here to maintain truth parity for Open Gravity.*
