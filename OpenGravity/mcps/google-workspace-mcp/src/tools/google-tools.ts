import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Herramientas de Gmail
export function registerGmailTools(server: McpServer, auth: OAuth2Client) {
    const gmail = google.gmail({ version: 'v1', auth });

    server.registerTool(
        "gmail_list_messages",
        {
            title: "List Gmail Messages",
            description: "List the contents of the user's Gmail inbox.",
            inputSchema: z.object({
                maxResults: z.number().int().min(1).max(100).default(10),
                q: z.string().optional().describe("Search query to filter messages (e.g. 'from:example.com')")
            })
        },
        async ({ maxResults, q }) => {
            const res = await gmail.users.messages.list({
                userId: 'me',
                maxResults,
                q
            });
            return {
                content: [{ type: "text", text: JSON.stringify(res.data.messages || [], null, 2) }],
                structuredContent: res.data
            };
        }
    );

    server.registerTool(
        "gmail_get_message",
        {
            title: "Get Gmail Message",
            description: "Get the full content of a specific Gmail message by ID.",
            inputSchema: z.object({
                id: z.string().describe("The ID of the message to retrieve")
            })
        },
        async ({ id }) => {
            const res = await gmail.users.messages.get({
                userId: 'me',
                id
            });
            return {
                content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
                structuredContent: res.data
            };
        }
    );
}

// Herramientas de Google Drive
export function registerDriveTools(server: McpServer, auth: OAuth2Client) {
    const drive = google.drive({ version: 'v3', auth });

    server.registerTool(
        "drive_list_files",
        {
            title: "List Drive Files",
            description: "List files and folders in the user's Google Drive.",
            inputSchema: z.object({
                pageSize: z.number().int().min(1).max(100).default(10),
                q: z.string().optional().describe("Search query (e.g. 'name contains \"Invoice\"')")
            })
        },
        async ({ pageSize, q }) => {
            const res = await drive.files.list({
                pageSize,
                q,
                fields: 'nextPageToken, files(id, name, mimeType)'
            });
            return {
                content: [{ type: "text", text: JSON.stringify(res.data.files || [], null, 2) }],
                structuredContent: res.data
            };
        }
    );
}

// Herramientas de Google Calendar
export function registerCalendarTools(server: McpServer, auth: OAuth2Client) {
    const calendar = google.calendar({ version: 'v3', auth });

    server.registerTool(
        "calendar_list_events",
        {
            title: "List Calendar Events",
            description: "List upcoming events from the user's primary calendar.",
            inputSchema: z.object({
                maxResults: z.number().int().min(1).max(100).default(10),
                timeMin: z.string().optional().describe("Minimum time to list events from (ISO format)")
            })
        },
        async ({ maxResults, timeMin }) => {
            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin || (new Date()).toISOString(),
                maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return {
                content: [{ type: "text", text: JSON.stringify(res.data.items || [], null, 2) }],
                structuredContent: res.data
            };
        }
    );
}
