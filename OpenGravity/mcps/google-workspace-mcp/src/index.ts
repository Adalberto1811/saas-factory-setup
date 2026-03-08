#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGmailTools, registerDriveTools, registerCalendarTools } from './tools/google-tools.js';
import { getGoogleClient } from './services/google-auth.js';
import fs from 'fs';
import path from 'path';

async function main() {
    const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error("❌ ERROR: El archivo 'credentials.json' no existe en la carpeta del servidor MCP.");
        console.error("Por favor, créalo siguiendo las instrucciones de Socio Boss.");
        process.exit(1);
    }

    const server = new McpServer({
        name: "google-workspace-mcp-server",
        version: "1.0.0"
    });

    try {
        const auth = await getGoogleClient();
        registerGmailTools(server, auth);
        registerDriveTools(server, auth);
        registerCalendarTools(server, auth);

        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("✅ Google Workspace MCP Server operativo vía stdio.");
    } catch (error: any) {
        console.error("❌ Error arrancando el servidor:", error.message);
        process.exit(1);
    }
}

main().catch(console.error);
