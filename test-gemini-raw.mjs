
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

async function listModelsRaw() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Testing ListModels URL...`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ LIST MODELS SUCCESS!");
            fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
            console.log("Saved to models.json");
        } else {
            console.log("❌ LIST MODELS FAILED");
            console.log("Error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

listModelsRaw();
