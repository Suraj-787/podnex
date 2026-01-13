// Test script to verify worker is functioning
import { QueueService } from "./src/services/queue.service.js";

async function testWorker() {
    console.log("🧪 Testing worker...\n");

    try {
        // Add a test job
        const testJob = await QueueService.addPodcastJob({
            podcastId: "test-podcast-123",
            userId: "test-user-123",
            noteContent: "This is a test podcast content for worker verification",
            duration: "SHORT",
            hostVoice: "host",
            guestVoice: "guest",
            ttsProvider: "unreal",
        });

        console.log(`✅ Job added: ${testJob.jobId}`);
        console.log("⏳ Waiting for job to process...\n");

        // Wait a bit for processing
        await new Promise((resolve) => setTimeout(resolve, 8000));

        // Check job status
        const status = await QueueService.getJobStatus(testJob.jobId);
        console.log("📊 Job Status:", status);

        // Get queue stats
        const stats = await QueueService.getQueueStats();
        console.log("\n📈 Queue Stats:", stats);

        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

testWorker();
