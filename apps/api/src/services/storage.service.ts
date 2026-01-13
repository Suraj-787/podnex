import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

let s3Client: S3Client | null = null;
let BUCKET_NAME: string;

/**
 * Get or create S3 client (lazy initialization to ensure env vars are loaded)
 */
function getS3Client(): S3Client {
    if (!s3Client) {
        // Debug: Log S3 configuration
        console.log("🔧 Initializing S3 Client:");
        console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : '❌ MISSING'}`);
        console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set (' + process.env.AWS_SECRET_ACCESS_KEY.length + ' chars)' : '❌ MISSING'}`);
        console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1 (default)'}`);

        s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
            // Optional: For Cloudflare R2 or other S3-compatible services
            ...(process.env.S3_ENDPOINT && {
                endpoint: process.env.S3_ENDPOINT,
                forcePathStyle: true,
            }),
        });

        BUCKET_NAME = process.env.S3_BUCKET_NAME || "podnext-audio-storage";
        console.log(`   S3_BUCKET_NAME: ${BUCKET_NAME}\n`);
    }
    return s3Client;
}

function getBucketName(): string {
    if (!BUCKET_NAME) {
        BUCKET_NAME = process.env.S3_BUCKET_NAME || "podnext-audio-storage";
    }
    return BUCKET_NAME;
}

export class StorageService {
    static async uploadAudio(
        buffer: Buffer,
        podcastId: string,
        metadata?: Record<string, string>
    ): Promise<string> {
        console.log(`📤 Uploading audio to S3 for podcast: ${podcastId}`);
        console.log(`   Buffer size: ${buffer.length} bytes`);
        console.log(`   Bucket: ${getBucketName()}`);

        const key = `podcasts/${podcastId}/${nanoid()}.mp3`;
        console.log(`   Key: ${key}`);

        try {
            const command = new PutObjectCommand({
                Bucket: getBucketName(),
                Key: key,
                Body: buffer,
                ContentType: "audio/mpeg",
                Metadata: metadata,
            });

            await getS3Client().send(command);
            console.log(`✅ S3 upload successful`);

            // Return public URL or CDN URL
            const cdnUrl = process.env.S3_CDN_URL;
            if (cdnUrl) {
                return `${cdnUrl}/${key}`;
            }

            // Return S3 URL
            if (process.env.S3_ENDPOINT) {
                // For R2 or custom endpoint
                return `${process.env.S3_ENDPOINT}/${getBucketName()}/${key}`;
            }

            return `https://${getBucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        } catch (error: any) {
            console.error(`❌ S3 upload failed:`, error.message);
            console.error(`   Error name: ${error.name}`);
            console.error(`   Error code: ${error.code || 'N/A'}`);
            throw error;
        }
    }

    /**
     * Check if a URL is an S3 URL or a local path
     */
    private static isS3Url(url: string): boolean {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    static async getSignedDownloadUrl(
        audioUrl: string,
        expiresIn: number = 3600
    ): Promise<string> {
        // If it's a local path, return as-is
        if (!this.isS3Url(audioUrl)) {
            return audioUrl;
        }

        // Extract key from URL
        const url = new URL(audioUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        const command = new GetObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        return await getSignedUrl(getS3Client(), command, { expiresIn });
    }

    static async deleteAudio(audioUrl: string): Promise<void> {
        // If it's a local path, delete from filesystem
        if (!this.isS3Url(audioUrl)) {
            const fs = await import('fs/promises');
            const path = await import('path');
            const localPath = path.join(process.cwd(), 'public', audioUrl);
            await fs.unlink(localPath);
            return;
        }

        const url = new URL(audioUrl);
        const key = url.pathname.substring(1);

        const command = new DeleteObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        await getS3Client().send(command);
    }

    static async getMetadata(audioUrl: string) {
        // If it's a local path, get file stats
        if (!this.isS3Url(audioUrl)) {
            const fs = await import('fs/promises');
            const path = await import('path');
            const localPath = path.join(process.cwd(), 'public', audioUrl);
            const stats = await fs.stat(localPath);
            return {
                size: stats.size,
                contentType: 'audio/mpeg',
                lastModified: stats.mtime,
                metadata: {},
            };
        }

        const url = new URL(audioUrl);
        const key = url.pathname.substring(1);

        const command = new HeadObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        const response = await getS3Client().send(command);
        return {
            size: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
            metadata: response.Metadata,
        };
    }
}
