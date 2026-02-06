
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function findWorkingModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    // Read models from the previously saved JSON to avoid re-fetching if possible
    // or just fetch list again if needed. Let's use the file we saved.
    let models = [];
    try {
        const data = fs.readFileSync('models.json', 'utf8');
        const json = JSON.parse(data);
        models = json.models || [];
    } catch (e) {
        console.error("Could not read models.json", e);
        return;
    }

    // Filter for generation models
    const candidates = models.filter(m =>
        m.supportedGenerationMethods &&
        m.supportedGenerationMethods.includes('generateContent')
    );

    console.log(`Found ${candidates.length} candidate models. Testing availability...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const m of candidates) {
        // Remove "models/" prefix if present for the SDK
        const modelName = m.name.replace('models/', '');

        process.stdout.write(`Testing ${modelName.padEnd(40)} ... `);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ OK`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ Failed (${error.response.status}: ${error.response.statusText})`);
            } else {
                // Try to extract status from error message if possible
                const msg = error.message.toLowerCase();
                if (msg.includes('429') || msg.includes('quota')) {
                    console.log(`❌ Quota Exceeded (429)`);
                } else if (msg.includes('404') || msg.includes('not found')) {
                    console.log(`❌ Not Found (404)`);
                } else {
                    console.log(`❌ Error: ${error.message.split('[')[0].slice(0, 50)}`);
                }
            }
        }
    }
}

findWorkingModel();
