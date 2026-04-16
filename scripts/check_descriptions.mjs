import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function checkDescriptions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define a minimal schema for the query
        const artworkSchema = new mongoose.Schema({
            title: String,
            description: String,
            artist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: String
        }, { collection: 'artworks' });

        const userSchema = new mongoose.Schema({
            name: String
        }, { collection: 'users' });

        // Check if models are already compiled
        const Artwork = mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema);
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Find artworks where description is empty, null, or missing
        const artworksMissingDescription = await Artwork.find({
            $or: [
                { description: { $exists: false } },
                { description: null },
                { description: '' },
                { description: /^\s*$/ }
            ]
        }).populate('artist_id');

        console.log(`\nFound ${artworksMissingDescription.length} artworks without descriptions.\n`);

        if (artworksMissingDescription.length > 0) {
            const artistBreakdown = {};
            artworksMissingDescription.forEach(art => {
                const artistName = art.artist_id?.name || 'Unknown Artist';
                artistBreakdown[artistName] = (artistBreakdown[artistName] || 0) + 1;
            });

            console.log('Breakdown by Artist:');
            console.log('------------------------------------------');
            Object.entries(artistBreakdown)
                .sort((a, b) => b[1] - a[1])
                .forEach(([name, count]) => {
                    console.log(`| ${name.padEnd(25)} | ${count.toString().padStart(10)} |`);
                });
            console.log('------------------------------------------');
            
            console.log('\nShowing first 10 examples:');
            console.log('--------------------------------------------------------------------------------');
            artworksMissingDescription.slice(0, 10).forEach(art => {
                const artistName = art.artist_id?.name || 'Unknown Artist';
                console.log(`| ${art._id.toString().padEnd(22)} | ${art.title.slice(0, 30).padEnd(30)} | ${artistName.slice(0, 18).padEnd(18)} |`);
            });
            console.log('--------------------------------------------------------------------------------');
        } else {
            console.log('No artworks are missing descriptions.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDescriptions();
