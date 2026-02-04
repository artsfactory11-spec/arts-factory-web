import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    role: 'admin' | 'partner';
    name: string;
    artist_specialty?: string;
    artist_bio?: string;
    avatar_url?: string;
    signature_url?: string;
    activity_region?: string;
    activity_material?: string;
    activity_exhibitions?: string;
    instagram_url?: string;
    youtube_url?: string;
    blog_url?: string;
    tiktok_url?: string;
    isApproved: boolean;
    isSpotlight: boolean;
    status: 'pending' | 'approved' | 'rejected';
    wishlist: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'partner'], default: 'partner' },
    name: { type: String, required: true },
    artist_specialty: { type: String },
    artist_bio: { type: String },
    avatar_url: { type: String },
    signature_url: { type: String },
    activity_region: { type: String },
    activity_material: { type: String },
    activity_exhibitions: { type: String },
    instagram_url: { type: String },
    youtube_url: { type: String },
    blog_url: { type: String },
    tiktok_url: { type: String },
    isApproved: { type: Boolean, default: false },
    isSpotlight: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
