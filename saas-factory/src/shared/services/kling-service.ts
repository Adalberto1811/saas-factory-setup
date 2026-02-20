import axios from 'axios';
import { getKlingToken } from '../lib/kling-auth';

export interface KlingTask {
    id: string;
    status: 'queued' | 'processing' | 'succeeded' | 'failed';
    videoUrl?: string;
    error?: string;
}

export class KlingService {
    private static readonly API_BASE = 'https://api.klingai.com/v1';

    /**
     * Triggers a video generation task using Kling AI
     */
    static async createVideo(prompt: string, ratio: "16:9" | "9:16" = "16:9", logoUrl?: string): Promise<string> {
        const token = await getKlingToken();
        if (!token) {
            throw new Error("Kling AI credentials are missing or invalid in .env.local");
        }

        try {
            // Enhanced prompt with logo reference if provided
            const finalPrompt = logoUrl
                ? `${prompt}. Integrate naturally the logo or image found at ${logoUrl}.`
                : prompt;

            console.log("🎬 Kling: Triggering text2video task with prompt:", finalPrompt.substring(0, 100));

            const payload = {
                model: "kling-v1",
                prompt: finalPrompt,
                aspect_ratio: ratio,
            };

            const response = await axios.post(`${this.API_BASE}/videos/text2video`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            console.log("📨 Kling Status API Response Status:", response.status);

            if (response.data?.data?.task_id) {
                return response.data.data.task_id;
            } else {
                console.error("🚨 Kling Response Error Data:", JSON.stringify(response.data));
                throw new Error(response.data?.message || `Kling API Error (Code: ${response.data?.code})`);
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            console.error("🚨 Kling Create Task Fatal Error:", errorData || error.message);

            const details = errorData ? JSON.stringify(errorData) : error.message;
            throw new Error(`Kling API Failure: ${details}`);
        }
    }

    /**
     * Checks the status of a specific task
     */
    static async getTaskStatus(taskId: string): Promise<KlingTask> {
        const token = await getKlingToken();
        if (!token) {
            throw new Error("Kling AI credentials are missing or invalid in .env.local");
        }

        try {
            const response = await axios.get(`${this.API_BASE}/videos/text2video/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = response.data?.data;
            if (!data) {
                throw new Error("Invalid response from Kling status API");
            }

            // Map Kling statuses to our internal set
            let status: KlingTask['status'] = 'queued';
            if (data.task_status === 'succeeded') status = 'succeeded';
            else if (data.task_status === 'failed') status = 'failed';
            else if (data.task_status === 'processing') status = 'processing';
            else if (data.task_status === 'submitted') status = 'queued';

            return {
                id: data.task_id,
                status: status,
                videoUrl: data.task_result?.videos?.[0]?.url || null,
                error: status === 'failed' ? (data.task_status_msg || "Unknown error") : null
            };
        } catch (error: any) {
            console.error("🚨 Kling Status Error:", error.response?.data || error.message);
            throw new Error(`Kling API Error: ${error.response?.data?.message || error.message}`);
        }
    }
}
