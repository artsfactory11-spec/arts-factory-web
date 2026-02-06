import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
    name: string;
    email: string;
    phone: string;
    organization?: string;
    type: 'purchase' | 'rental' | 'general';
    artwork_id?: mongoose.Types.ObjectId;
    message?: string;
    status: 'pending' | 'contacted' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const InquirySchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    organization: { type: String },
    type: { type: String, enum: ['purchase', 'rental', 'general'], required: true },
    artwork_id: { type: Schema.Types.ObjectId, ref: 'Artwork' },
    message: { type: String },
    status: { type: String, enum: ['pending', 'contacted', 'completed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
