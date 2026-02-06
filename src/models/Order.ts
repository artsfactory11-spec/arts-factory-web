import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user_id: mongoose.Types.ObjectId;
    items: {
        artwork_id: mongoose.Types.ObjectId;
        price: number;
        type: 'purchase' | 'rental';
    }[];
    total_amount: number;
    payment_method: 'bank_transfer';
    depositor_name: string;
    status: 'pending_deposit' | 'paid' | 'shipping' | 'completed' | 'cancelled';
    shipping_address: {
        recipient: string;
        phone: string;
        address: string;
        detailAddress?: string;
        zipCode: string;
    };
    bank_info: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        artwork_id: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
        price: { type: Number, required: true },
        type: { type: String, enum: ['purchase', 'rental'], required: true }
    }],
    total_amount: { type: Number, required: true },
    payment_method: { type: String, default: 'bank_transfer' },
    depositor_name: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending_deposit', 'paid', 'shipping', 'completed', 'cancelled'],
        default: 'pending_deposit'
    },
    shipping_address: {
        recipient: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        detailAddress: { type: String },
        zipCode: { type: String, required: true }
    },
    bank_info: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountHolder: { type: String, required: true }
    }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
