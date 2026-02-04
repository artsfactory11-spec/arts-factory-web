import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        console.warn('Warning: MONGODB_URI is not defined. Database features will not work.');
        return null; // 에러를 던지는 대신 null을 반환하여 빌드 중단을 방지할 수 있습니다.
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        // Ensure debug mode is off unless specifically requested
        mongoose.set('debug', false);

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('=> MongoDB connected successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('=> MongoDB Connection Error:', e);
        return null; // 빌드 및 런타임 중단을 방지하기 위해 null 반환
    }

    return cached.conn;
}

export default dbConnect;
