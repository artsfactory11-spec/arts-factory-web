
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
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key && value && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
}

async function fixSpotlight() {
    const dbConnect = (await import("../src/lib/mongodb")).default;
    const User = (await import("../src/models/User")).default;

    await dbConnect();
    console.log("Fixing spotlight user...");

    const spotlightUser = await User.findOne({ isSpotlight: true });
    if (spotlightUser) {
        console.log(`Found spotlight user: ${spotlightUser.name}`);
        spotlightUser.status = 'approved';
        spotlightUser.role = 'partner';
        await spotlightUser.save();
        console.log("User updated to approved partner.");
    } else {
        console.log("No spotlight user found. creating fallback...");
        // Logic to create 'none' or just warn
        const recentUser = await User.findOne({ role: 'partner' });
        if (recentUser) {
            recentUser.isSpotlight = true;
            recentUser.status = 'approved';
            await recentUser.save();
            console.log(`Updated ${recentUser.name} to be spotlight and approved.`);
        } else {
            console.log("No partners found to promote.");
        }
    }

    process.exit(0);
}

fixSpotlight().catch(console.error);
