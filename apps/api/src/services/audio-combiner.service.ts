import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

interface AudioSegment {
    buffer: Buffer;
    duration: number;
}

interface CombinedAudio {
    buffer: Buffer;
    duration: number;
    size: number;
}

export class AudioCombinerService {
    /**
     * Combine multiple audio segments into a single file
     */
    static async combine(segments: AudioSegment[]): Promise<CombinedAudio> {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "podcast-"));

        try {
            // Save segments to temp files
            const segmentFiles: string[] = [];
            for (let i = 0; i < segments.length; i++) {
                const filePath = path.join(tempDir, `segment-${i}.mp3`);
                await fs.writeFile(filePath, segments[i]!.buffer);
                segmentFiles.push(filePath);
            }

            // TEMPORARY: Skip silence generation due to FFmpeg lavfi issues
            // TODO: Fix lavfi input format or use alternative silence generation
            // const silenceFile = path.join(tempDir, "silence.mp3");
            // await this.createSilence(silenceFile, 0.5);

            // Create concat list (without silence for now)
            const concatList: string[] = segmentFiles;
            // Original code with silence:
            // for (let i = 0; i < segmentFiles.length; i++) {
            //     concatList.push(segmentFiles[i]!);
            //     if (i < segmentFiles.length - 1) {
            //         concatList.push(silenceFile);
            //     }
            // }

            // Combine all files
            const outputFile = path.join(tempDir, "combined.mp3");
            await this.mergeFiles(concatList, outputFile);

            // Read the combined file
            const buffer = await fs.readFile(outputFile);
            const stats = await fs.stat(outputFile);

            // Calculate total duration
            const totalDuration = segments.reduce(
                (sum, seg) => sum + seg.duration,
                0
            );
            const pauseTime = (segments.length - 1) * 0.5;

            return {
                buffer,
                duration: Math.round(totalDuration + pauseTime),
                size: stats.size,
            };
        } finally {
            // Cleanup temp directory
            await this.cleanupTempDir(tempDir);
        }
    }

    /**
     * Create a silence audio file
     */
    private static createSilence(
        outputPath: string,
        duration: number
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input('anullsrc=channel_layout=stereo:sample_rate=44100')
                .inputFormat('lavfi')
                .duration(duration)
                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });
    }

    /**
     * Merge multiple audio files
     */
    private static mergeFiles(
        inputFiles: string[],
        outputPath: string
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const command = ffmpeg();

            // Add all input files
            inputFiles.forEach((file) => {
                command.input(file);
            });

            // Create filter complex for concatenation
            const filterComplex = inputFiles
                .map((_, i) => `[${i}:a]`)
                .join("") + `concat=n=${inputFiles.length}:v=0:a=1[out]`;

            command
                .complexFilter(filterComplex)
                .outputOptions(["-map", "[out]"])
                .audioCodec("libmp3lame")
                .audioBitrate("128k")
                .audioFrequency(44100)
                .output(outputPath)
                .on("end", () => resolve())
                .on("error", (err) => reject(err))
                .run();
        });
    }

    /**
     * Cleanup temporary directory
     */
    private static async cleanupTempDir(dir: string): Promise<void> {
        try {
            const files = await fs.readdir(dir);
            await Promise.all(
                files.map((file) => fs.unlink(path.join(dir, file)))
            );
            await fs.rmdir(dir);
        } catch (error) {
            console.error("Failed to cleanup temp directory:", error);
            // Don't throw - cleanup is best effort
        }
    }
}
