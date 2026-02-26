import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../../.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim();
    }
});

const API_KEY = env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("No GOOGLE_API_KEY found in .env");
    process.exit(1);
}

const dataPath = path.resolve(__dirname, '../public/data/categories.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function geocode(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.results && json.results.length > 0) {
            return json.results[0].geometry.location; // { lat, lng }
        } else {
            console.log(`No results for ${address}: ${json.status}`);
            return null;
        }
    } catch (err) {
        console.error(`Error geocoding ${address}:`, err);
        return null;
    }
}

async function run() {
    let updatedCount = 0;

    for (const category of data) {
        for (const biz of category.top_10) {
            if (!biz.latitude || !biz.longitude) {
                console.log(`Geocoding: ${biz.name} - ${biz.address}`);
                const location = await geocode(biz.address);
                if (location) {
                    biz.latitude = location.lat;
                    biz.longitude = location.lng;
                    updatedCount++;
                }
                // sleep for 100ms to avoid rate limits
                await new Promise(r => setTimeout(r, 100));
            }
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        console.log(`Successfully added coordinates to ${updatedCount} businesses.`);
    } else {
        console.log("No businesses needed geocoding.");
    }
}

run();
