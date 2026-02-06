import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    role: 'admin' | 'partner' | 'user';
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
    status: 'pending' | 'approved' | 'rejected' | 'none';
    wishlist: mongoose.Types.ObjectId[];
    // Extended Profile for Commerce
    phone?: string;
    address?: string;
    detailAddress?: string;
    zipCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'partner', 'user'], default: 'user' },
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
    isSpotlight: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    // Commerce Fields
    phone: { type: String },
    address: { type: String },
    detailAddress: { type: String },
    zipCode: { type: String },
}, { timestamps: true });

if (mongoose.models.User) {
    delete (mongoose.models as any).User;
}

export default mongoose.model<IUser>('User', UserSchema);
