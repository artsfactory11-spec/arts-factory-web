import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    user_id: mongoose.Types.ObjectId;
    artwork_id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId; // 초기 주문 참조
    status: 'pending_approve' | 'active' | 'overdue' | 'ended';
    billing_cycle: 'monthly' | 'yearly';
    start_date?: Date;
    end_date?: Date;
    next_payment_due?: Date;
    monthly_fee: number;
    deposit_history: {
        date: Date;
        amount: number;
        confirmed_by: string; // admin email or id
        note?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    artwork_id: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: {
        type: String,
        enum: ['pending_approve', 'active', 'overdue', 'ended'],
        default: 'pending_approve'
    },
    billing_cycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    start_date: { type: Date },
    end_date: { type: Date },
    next_payment_due: { type: Date },
    monthly_fee: { type: Number, required: true },
    deposit_history: [{
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        confirmed_by: { type: String },
        note: { type: String }
    }]
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
