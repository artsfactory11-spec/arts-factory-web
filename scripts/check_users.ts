
import fs from 'fs';
import path from 'path';

// Manual parsing of .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join back in case value has =
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key && value && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
}
console.log("MONGODB_URI length:", process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);

async function checkUsers() {
    const dbConnect = (await import("../src/lib/mongodb")).default;
    const User = (await import("../src/models/User")).default;

    await dbConnect();
    console.log("Checking users...");

    const spotlightUser = await User.findOne({ isSpotlight: true });
    console.log("Spotlight User:", spotlightUser ? spotlightUser.name : "None");

    const approvedPartners = await User.find({ role: 'partner', status: 'approved' });
    console.log("Approved Partners Count:", approvedPartners.length);

    if (approvedPartners.length > 0) {
        console.log("First Approved Partner:", approvedPartners[0].name);
    }

    const allPartners = await User.find({ role: 'partner' });
    console.log("All Partners Count:", allPartners.length);
    if (allPartners.length > 0) {
        console.log("Sample Partner:", allPartners[0]);
    }

    process.exit(0);
}

checkUsers().catch(console.error);
