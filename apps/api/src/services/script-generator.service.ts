import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { PodcastDuration } from "@repo/database";

interface ScriptSegment {
    speaker: "host" | "guest";
    text: string;
}

interface GeneratedScript {
    segments: ScriptSegment[];
    estimatedDuration: number;
}

export class ScriptGeneratorService {
    /**
     * Generate a podcast script from note content
     */
    static async generate(
        noteContent: string,
        duration: PodcastDuration
    ): Promise<GeneratedScript> {
        try {
            const prompt = this.buildPrompt(noteContent, duration);

            const { text } = await generateText({
                model: openai("gpt-4-turbo"),
                prompt,
                temperature: 0.7,
            });

            const segments = this.parseScript(text);

            return {
                segments,
                estimatedDuration: this.estimateDuration(segments),
            };
        } catch (error: any) {
            console.error("Script generation failed:", error);
            throw new Error(`Failed to generate script: ${error.message}`);
        }
    }

    /**
     * Build the prompt for OpenAI
     */
    private static buildPrompt(
        noteContent: string,
        duration: PodcastDuration
    ): string {
        const targetLength = this.getTargetLength(duration);

        return `You are a podcast script writer. Create an engaging, natural conversation between a host and a guest based on the following content.

CONTENT:
${noteContent}

REQUIREMENTS:
- Target length: ${targetLength} words (for ${duration} duration)
- Format: Alternating between HOST and GUEST
- Style: Conversational, engaging, natural
- Include: Opening greeting, main discussion, closing remarks
- Avoid: Overly formal language, jargon without explanation
- Make it sound like a real conversation with natural transitions

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
HOST: [Opening greeting and introduction]
GUEST: [Response and engagement]
HOST: [Question or topic introduction]
GUEST: [Detailed response]
...
HOST: [Closing remarks]
GUEST: [Final thoughts and goodbye]

Generate the script now:`;
    }

    /**
     * Parse the generated script into segments
     */
    private static parseScript(text: string): ScriptSegment[] {
        const segments: ScriptSegment[] = [];
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
            const hostMatch = line.match(/^HOST:\s*(.+)$/i);
            const guestMatch = line.match(/^GUEST:\s*(.+)$/i);

            if (hostMatch && hostMatch[1]) {
                segments.push({
                    speaker: "host",
                    text: hostMatch[1].trim(),
                });
            } else if (guestMatch && guestMatch[1]) {
                segments.push({
                    speaker: "guest",
                    text: guestMatch[1].trim(),
                });
            }
        }

        // Ensure we have at least some segments
        if (segments.length === 0) {
            throw new Error("Failed to parse script - no valid segments found");
        }

        return segments;
    }

    /**
     * Estimate duration based on word count
     * Average speaking rate: ~150 words per minute
     */
    private static estimateDuration(segments: ScriptSegment[]): number {
        const totalWords = segments.reduce((sum, segment) => {
            return sum + segment.text.split(/\s+/).length;
        }, 0);

        // 150 words per minute, plus pauses between segments
        const speakingTime = (totalWords / 150) * 60;
        const pauseTime = segments.length * 0.5; // 0.5s pause between segments

        return Math.round(speakingTime + pauseTime);
    }

    /**
     * Get target word count based on duration
     */
    private static getTargetLength(duration: PodcastDuration): string {
        switch (duration) {
            case "SHORT":
                return "800-1000"; // ~5-7 minutes
            case "LONG":
                return "3000-4000"; // ~20-30 minutes
            default:
                return "1000-1500";
        }
    }
}
