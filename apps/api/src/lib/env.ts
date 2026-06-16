import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../../.env");
console.log("📁 Loading .env from:", envPath);

// Load .env file IMMEDIATELY
// override: true ensures this always wins over stale vars exported in the shell profile
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
    console.error("❌ Error loading .env:", result.error);
} else {
    console.log("✅ .env loaded successfully");
    console.log("🔑 DODO_PAYMENTS_WEBHOOK_KEY after load:", process.env.DODO_PAYMENTS_WEBHOOK_KEY ? "SET" : "NOT SET");
    console.log("🔑 DODO_PAYMENTS_API_KEY after load:", process.env.DODO_PAYMENTS_API_KEY ? "SET" : "NOT SET");
}

// Export for use in other files if needed
export const envLoaded = true;
