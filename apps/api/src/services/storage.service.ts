import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
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

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "podnex-audio";

export class StorageService {
    static async uploadAudio(
        buffer: Buffer,
        podcastId: string,
        metadata?: Record<string, string>
    ): Promise<string> {
        const key = `podcasts/${podcastId}/${nanoid()}.mp3`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: "audio/mpeg",
            Metadata: metadata,
        });

        await s3Client.send(command);

        // Return public URL or CDN URL
        const cdnUrl = process.env.S3_CDN_URL;
        if (cdnUrl) {
            return `${cdnUrl}/${key}`;
        }

        // Return S3 URL
        if (process.env.S3_ENDPOINT) {
            // For R2 or custom endpoint
            return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
        }

        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    static async getSignedDownloadUrl(
        audioUrl: string,
        expiresIn: number = 3600
    ): Promise<string> {
        // Extract key from URL
        const url = new URL(audioUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        return await getSignedUrl(s3Client, command, { expiresIn });
    }

    static async deleteAudio(audioUrl: string): Promise<void> {
        const url = new URL(audioUrl);
        const key = url.pathname.substring(1);

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    }

    static async getMetadata(audioUrl: string) {
        const url = new URL(audioUrl);
        const key = url.pathname.substring(1);

        const command = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        return {
            size: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
            metadata: response.Metadata,
        };
    }
}
