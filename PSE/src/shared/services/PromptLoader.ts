// PromptLoader - Vercel Serverless Compatible
// Uses embedded prompts from TypeScript module instead of fs.readFileSync

import {
    COACH_MASTER_PROMPT,
    COACH_STRATEGY_PROMPT,
    NUTRITIONIST_PROMPT,
    PHYSICAL_TRAINER_PROMPT,
    PSYCHOLOGIST_PROMPT,
    UNIVERSAL_COACH_PROMPT
} from '@/core/prompts/coachPrompts';

export class PromptLoader {
    /**
     * Returns the master coach prompt from embedded module.
     * This method is Vercel serverless compatible.
     */
    static async getMasterPrompt(): Promise<{ content: string; charCount: number }> {
        try {
            const content = COACH_MASTER_PROMPT;
            const charCount = content.length;

            console.log(`[PromptLoader] Integrity Check: Loaded master prompt (${charCount} characters).`);

            return { content, charCount };
        } catch (error) {
            console.error('[PromptLoader] Error reading master prompt:', error);
            throw new Error('Failed to load Coach Master Prompt for AI call.');
        }
    }

    /**
     * Returns the strategy prompt from embedded module.
     */
    static async getStrategyPrompt(): Promise<string> {
        return COACH_STRATEGY_PROMPT;
    }

    static async getNutritionistPrompt(): Promise<string> {
        return NUTRITIONIST_PROMPT;
    }

    static async getPhysicalTrainerPrompt(): Promise<string> {
        return PHYSICAL_TRAINER_PROMPT;
    }

    static async getPsychologistPrompt(): Promise<string> {
        return PSYCHOLOGIST_PROMPT;
    }

    static async getUniversalPrompt(): Promise<string> {
        return UNIVERSAL_COACH_PROMPT;
    }

    /**
     * Verifies prompt integrity (always returns true for embedded prompts).
     */
    static async verifyIntegrity(): Promise<boolean> {
        const { charCount } = await this.getMasterPrompt();
        return charCount > 0;
    }
}
