
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function scanModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List of potential model names to try
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("Scanning for available models...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS! Response: ${response.text().slice(0, 20)}...`);

            // If we found one, print it clearly so we can use it
            console.log(`\nRECOMMENDATION: Update ai.ts to use model "${modelName}"`);
            process.exit(0);
        } catch (error) {
            // checking for 404 (not found) or 400 (not supported)
            if (error.status === 404) {
                console.log(`❌ Not Found`);
            } else {
                console.log(`❌ Error: ${error.message.split('[')[0]}`);
            }
        }
    }
    console.log("All attempts failed.");
}

scanModels();
