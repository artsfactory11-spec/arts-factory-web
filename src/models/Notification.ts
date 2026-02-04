import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient_id: mongoose.Types.ObjectId;
    sender_id?: mongoose.Types.ObjectId;
    type: 'inquiry' | 'artwork_approval' | 'artwork_rejection' | 'system';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['inquiry', 'artwork_approval', 'artwork_rejection', 'system'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
