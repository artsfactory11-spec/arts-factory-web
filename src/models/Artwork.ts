import mongoose, { Schema, Document } from 'mongoose';
import './User';

export interface IArtwork extends Document {
    title: string;
    description: string;
    artist_id: mongoose.Types.ObjectId;
    category: string; // 장르 및 매체
    style?: string; // 작품 스타일
    subject?: string; // 소재 및 주제
    season?: string;
    space?: string; // 공간 및 인테리어 목적
    size?: string; // (기존 유지) 예: 10호 (53 x 45.5cm)
    width?: number; // 가로 (cm)
    height?: number; // 세로 (cm)
    ho?: number; // 호수
    year?: string; // 제작연도
    material?: string; // 재료 (예: Oil on canvas)
    price: number;
    rental_price: number;
    firebase_image_url: string;
    firebase_storage_path: string;
    vr_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    rental_status: 'available' | 'processing' | 'rented' | 'unavailable';
    isCurated: boolean;
    createdAt: Date;
}

const ArtworkSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    artist_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String },
    style: { type: String },
    subject: { type: String },
    season: { type: String },
    space: { type: String },
    size: { type: String },
    width: { type: Number },
    height: { type: Number },
    ho: { type: Number },
    year: { type: String },
    material: { type: String },
    price: { type: Number, default: 0 },
    rental_price: { type: Number, default: 0 },
    firebase_image_url: { type: String, required: true },
    firebase_storage_path: { type: String, required: true },
    vr_url: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rental_status: { type: String, enum: ['available', 'processing', 'rented', 'unavailable'], default: 'available' },
    isCurated: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Artwork || mongoose.model<IArtwork>('Artwork', ArtworkSchema);
