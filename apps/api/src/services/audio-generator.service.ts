interface AudioSegment {
    buffer: Buffer;
    duration: number; // in seconds
}

interface VoiceConfig {
    hostVoice: string;
    guestVoice: string;
    ttsProvider: string;
}

interface ScriptSegment {
    speaker: "host" | "guest";
    text: string;
}

export class AudioGeneratorService {
    /**
     * Generate audio for all script segments
     */
    static async generateAll(
        segments: ScriptSegment[],
        voiceConfig: VoiceConfig
    ): Promise<AudioSegment[]> {
        const audioSegments: AudioSegment[] = [];

        for (const segment of segments) {
            const voice =
                segment.speaker === "host"
                    ? voiceConfig.hostVoice
                    : voiceConfig.guestVoice;

            const audio = await this.generateSegment(
                segment.text,
                voice,
                voiceConfig.ttsProvider
            );

            audioSegments.push(audio);
        }

        return audioSegments;
    }

    /**
     * Generate audio for a single segment
     */
    static async generateSegment(
        text: string,
        voice: string,
        provider: string
    ): Promise<AudioSegment> {
        try {
            if (provider === "unreal") {
                return await this.unrealSpeech(text, voice);
            } else if (provider === "elevenlabs") {
                return await this.elevenLabs(text, voice);
            } else {
                throw new Error(`Unsupported TTS provider: ${provider}`);
            }
        } catch (error: any) {
            console.error(`Audio generation failed for segment:`, error);
            throw new Error(`Failed to generate audio: ${error.message}`);
        }
    }

    /**
     * Generate audio using Unreal Speech
     */
    private static async unrealSpeech(
        text: string,
        voice: string
    ): Promise<AudioSegment> {
        const apiKey = process.env.UNREAL_SPEECH_API_KEY;

        if (!apiKey) {
            throw new Error("UNREAL_SPEECH_API_KEY not configured");
        }

        // Map voice names to Unreal Speech voice IDs
        const voiceMap: Record<string, string> = {
            host: "Scarlett", // Female voice
            guest: "Dan", // Male voice
            // Add more voice mappings as needed
        };

        const voiceId = voiceMap[voice] || "Scarlett";

        const response = await fetch("https://api.v6.unrealspeech.com/stream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                Text: text,
                VoiceId: voiceId,
                Bitrate: "128k",
                Speed: "0", // Normal speed
                Pitch: "1", // Normal pitch
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Unreal Speech API error: ${error}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Estimate duration (rough calculation based on text length)
        // Average speaking rate: ~150 words per minute
        const wordCount = text.split(/\s+/).length;
        const duration = (wordCount / 150) * 60;

        return {
            buffer,
            duration: Math.round(duration),
        };
    }

    /**
     * Generate audio using ElevenLabs (alternative)
     */
    private static async elevenLabs(
        text: string,
        voice: string
    ): Promise<AudioSegment> {
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            throw new Error("ELEVENLABS_API_KEY not configured");
        }

        // Map voice names to ElevenLabs voice IDs
        const voiceMap: Record<string, string> = {
            host: "21m00Tcm4TlvDq8ikWAM", // Rachel
            guest: "AZnzlk1XvdvUeBnXmlld", // Domi
            // Add more voice mappings as needed
        };

        const voiceId = voiceMap[voice] || "21m00Tcm4TlvDq8ikWAM";

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${error}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Estimate duration
        const wordCount = text.split(/\s+/).length;
        const duration = (wordCount / 150) * 60;

        return {
            buffer,
            duration: Math.round(duration),
        };
    }
}
