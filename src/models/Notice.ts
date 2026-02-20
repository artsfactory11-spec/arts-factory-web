import mongoose, { Schema, Document } from 'mongoose';

export interface IBaseNotice {
    _id?: string;
    title: string;
    content: string;
    images: {
        url: string;
        path: string;
    }[];
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    priority: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotice extends Omit<IBaseNotice, '_id'>, Document {
    _id: mongoose.Types.ObjectId;
}

const NoticeSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{
        url: { type: String, required: true },
        path: { type: String, required: true }
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
}, { timestamps: true });

// 기간 내 활성화된 공지사항을 찾는 인덱스
NoticeSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

export default mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
