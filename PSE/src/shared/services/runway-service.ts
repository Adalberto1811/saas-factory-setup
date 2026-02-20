import axios from 'axios';

const MARKETSYN_SDK_TOKEN = process.env.MARKETSYN_SDK_TOKEN;

export interface RunwayTask {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    videoUrl?: string;
    error?: string;
}

export class RunwayService {
    private static readonly API_BASE = 'https://api.runwayml.com/v1';

    /**
     * Triggers a video generation task using Gen-3 Alpha Turbo
     */
    static async createVideo(prompt: string, ratio: "16:9" | "9:16" = "16:9"): Promise<string> {
        if (!MARKETSYN_SDK_TOKEN || MARKETSYN_SDK_TOKEN.includes('placeholder')) {
            throw new Error("MARKETSYN_SDK_TOKEN is missing or is still a placeholder in .env.local");
        }

        try {
            console.log("🎬 Runway: Triggering Gen-3 Alpha Turbo task...");
            const response = await axios.post(`${this.API_BASE}/tasks`, {
                taskType: "text_to_video",
                model: "gen3a_turbo",
                promptText: prompt,
                aspectRatio: ratio === "16:9" ? "landscape" : "portrait"
            }, {
                headers: {
                    'Authorization': `Bearer ${MARKETSYN_SDK_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Runway-Version': '2024-11-06'
                }
            });

            if (!response.data.id) {
                throw new Error("Failed to get task ID from Runway API");
            }

            return response.data.id;
        } catch (error: any) {
            console.error("🚨 Runway Create Task Error:", error.response?.data || error.message);
            throw new Error(`Runway API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Checks the status of a specific task
     */
    static async getTaskStatus(taskId: string): Promise<RunwayTask> {
        if (!MARKETSYN_SDK_TOKEN) {
            throw new Error("MARKETSYN_SDK_TOKEN is missing in .env.local");
        }

        try {
            const response = await axios.get(`${this.API_BASE}/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${MARKETSYN_SDK_TOKEN}`,
                    'X-Runway-Version': '2024-11-06'
                }
            });

            const data = response.data;
            return {
                id: data.id,
                status: data.status,
                videoUrl: data.output?.[0] || null,
                error: data.failureReason || null
            };
        } catch (error: any) {
            console.error("🚨 Runway Status Error:", error.response?.data || error.message);
            throw new Error(`Runway API Error: ${error.response?.data?.message || error.message}`);
        }
    }
}
