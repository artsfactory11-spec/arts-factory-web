import mongoose, { Schema, Document } from 'mongoose';
import './User';

export interface IArtwork extends Document {
    title: string;
    description: string;
    artist_id: mongoose.Types.ObjectId;
    category: string;
    season?: string;
    space?: string;
    size?: string; // 예: 10호 (53 x 45.5cm)
    year?: string; // 제작연도
    material?: string; // 재료 (예: Oil on canvas)
    price: number;
    rental_price: number;
    firebase_image_url: string;
    firebase_storage_path: string;
    vr_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    isCurated: boolean;
    createdAt: Date;
}

const ArtworkSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    artist_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String },
    season: { type: String },
    space: { type: String },
    size: { type: String },
    year: { type: String },
    material: { type: String },
    price: { type: Number, default: 0 },
    rental_price: { type: Number, default: 0 },
    firebase_image_url: { type: String, required: true },
    firebase_storage_path: { type: String, required: true },
    vr_url: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isCurated: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Artwork || mongoose.model<IArtwork>('Artwork', ArtworkSchema);
