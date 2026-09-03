import { Schema, model, Types, Document } from "mongoose";

export type PaymentProduct = "hint" | "boost";
export type PaymentStatus = "created" | "paid" | "failed";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  product: PaymentProduct;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
  product: { type: String, enum: ["hint", "boost"], required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "INR", uppercase: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IPayment>("Payment", paymentSchema);
