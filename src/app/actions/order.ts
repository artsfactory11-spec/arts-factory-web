'use server';

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Artwork from "@/models/Artwork";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Bank Configuration (Can be moved to DB or Env later)
const BANK_INFO = {
    bankName: "Shinhan Bank",
    accountNumber: "110-123-456789",
    accountHolder: "Arts Factory Co., Ltd."
};

interface CreateOrderParams {
    items: {
        artwork_id: string;
        price: number;
        type: 'purchase' | 'rental';
    }[];
    depositor_name: string;
    shipping_address: {
        recipient: string;
        phone: string;
        address: string;
        detailAddress?: string;
        zipCode: string;
    };
    save_address?: boolean;
}

export async function createOrder(params: CreateOrderParams) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return { success: false, error: "Authentication required" };
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Validate items
        if (!params.items || params.items.length === 0) {
            return { success: false, error: "No items in order" };
        }

        let total_amount = 0;

        // Verify artworks and calculate total
        for (const item of params.items) {
            const artwork = await Artwork.findById(item.artwork_id);
            if (!artwork) {
                return { success: false, error: `Artwork not found: ${item.artwork_id}` };
            }
            if (artwork.status !== 'approved') {
                return { success: false, error: `Artwork not available: ${artwork.title}` };
            }

            // Check availability (Simple check - can be enhanced)
            // If purchase, check if sold. If rental, check if currently rented.
            // For now, allow order creation, admin will verify availability on deposit confirm.

            total_amount += item.price;
        }

        // Create Order
        const order = await Order.create({
            user_id: user._id,
            items: params.items,
            total_amount,
            payment_method: 'bank_transfer',
            depositor_name: params.depositor_name,
            status: 'pending_deposit',
            shipping_address: params.shipping_address,
            bank_info: BANK_INFO
        });

        // Save address to user profile if requested
        if (params.save_address) {
            user.address = params.shipping_address.address;
            user.detailAddress = params.shipping_address.detailAddress;
            user.zipCode = params.shipping_address.zipCode;
            user.phone = params.shipping_address.phone;
            await user.save();
        }

        return {
            success: true,
            orderId: order._id.toString(),
            bankInfo: BANK_INFO
        };

    } catch (error) {
        console.error("Create Order Error:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function confirmDeposit(orderId: string) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Admin check
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || admin.role !== 'admin') {
            return { success: false, error: "Admin access required" };
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return { success: false, error: "Order not found" };
        }

        if (order.status !== 'pending_deposit') {
            return { success: false, error: "Order is not pending deposit" };
        }

        // Update Order Status
        order.status = 'paid';
        await order.save();

        // Process Subscriptions for Rental Items
        const rentalItems = order.items.filter((item: any) => item.type === 'rental');

        for (const item of rentalItems) {
            // Calculate rental period (Default 1 month)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            await Subscription.create({
                user_id: order.user_id,
                artwork_id: item.artwork_id,
                order_id: order._id,
                status: 'active',
                billing_cycle: 'monthly',
                start_date: startDate,
                end_date: endDate,
                next_payment_due: endDate,
                monthly_fee: item.price,
                deposit_history: [{
                    date: new Date(),
                    amount: item.price,
                    confirmed_by: admin.email,
                    note: "Initial Deposit Confirmed"
                }]
            });
        }

        revalidatePath('/admin/orders');
        return { success: true };

    } catch (error) {
        console.error("Confirm Deposit Error:", error);
        return { success: false, error: "Failed to confirm deposit" };
    }
}

export async function getAdminOrders() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) return { success: false, error: "Unauthorized" };

        // Admin check
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || admin.role !== 'admin') return { success: false, error: "Forbidden" };

        const orders = await Order.find({})
            .populate('user_id', 'name email')
            .populate('items.artwork_id', 'title')
            .sort({ createdAt: -1 });

        return { success: true, orders: JSON.parse(JSON.stringify(orders)) };

    } catch (error) {
        console.error("Get Admin Orders Error:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}
