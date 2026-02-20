import axios from 'axios';

const MARKETSYN_SDK_TOKEN = process.env.MARKETSYN_SDK_TOKEN;

export interface ReplicateTask {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    videoUrl?: string;
    error?: string;
}

export class ReplicateService {
    private static readonly API_BASE = 'https://api.replicate.com/v1';

    // Using Luma Dream Machine on Replicate as a high-quality default
    private static readonly MODEL_VERSION = "luma/dream-machine";

    /**
     * Triggers a video generation task using Replicate
     */
    static async createVideo(prompt: string, ratio: "16:9" | "9:16" = "16:9"): Promise<string> {
        if (!MARKETSYN_SDK_TOKEN || MARKETSYN_SDK_TOKEN.includes('placeholder')) {
            throw new Error("REPLICATE_API_TOKEN (MARKETSYN_SDK_TOKEN) is missing or is still a placeholder in .env.local");
        }

        try {
            console.log("🎬 Replicate: Triggering Video Task...");
            const response = await axios.post(`${this.API_BASE}/predictions`, {
                version: "dream-machine", // Replicate allows simplified model names sometimes or full version hashes
                // Note: For Replicate, sometimes you need the full version hash. 
                // However, many models have "model/name" shortcut.
                // We'll use a direct model slug if possible or the most stable luma version.
                model: "luma/dream-machine",
                input: {
                    prompt: prompt,
                    aspect_ratio: ratio === "16:9" ? "16:9" : "9:16"
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${MARKETSYN_SDK_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data.id) {
                throw new Error("Failed to get prediction ID from Replicate API");
            }

            return response.data.id;
        } catch (error: any) {
            console.error("🚨 Replicate Create Task Error:", error.response?.data || error.message);
            throw new Error(`Replicate API Error: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Checks the status of a specific task
     */
    static async getTaskStatus(taskId: string): Promise<ReplicateTask> {
        if (!MARKETSYN_SDK_TOKEN || MARKETSYN_SDK_TOKEN.includes('placeholder')) {
            throw new Error("REPLICATE_API_TOKEN (MARKETSYN_SDK_TOKEN) is missing in .env.local");
        }

        try {
            const response = await axios.get(`${this.API_BASE}/predictions/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${MARKETSYN_SDK_TOKEN}`
                }
            });

            const data = response.data;
            return {
                id: data.id,
                status: data.status,
                videoUrl: data.output?.[0] || data.output || null, // Replicate output can be an array or string
                error: data.error || null
            };
        } catch (error: any) {
            console.error("🚨 Replicate Status Error:", error.response?.data || error.message);
            throw new Error(`Replicate API Error: ${error.response?.data?.detail || error.message}`);
        }
    }
}
