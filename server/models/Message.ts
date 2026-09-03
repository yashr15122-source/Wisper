import { Schema, model, Types, Document } from "mongoose";

export interface IMessage extends Document {
  recipientId: Types.ObjectId;
  content: string;
  prompt: string;
  isOpened: boolean;
  isFavorited: boolean;
  isBoosted: boolean;
  hintUnlocked: boolean;
  senderInstagram?: string;
  senderHints: {
    deviceType: string;
    browser: string;
    location: string;
    carrier: string;
    timestamp: Date;
  };
  senderHash: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  prompt: { type: String, required: true, maxlength: 120 },
  isOpened: { type: Boolean, default: false },
  isFavorited: { type: Boolean, default: false },
  isBoosted: { type: Boolean, default: false, index: true },
  hintUnlocked: { type: Boolean, default: false },
  senderInstagram: { type: String, trim: true, maxlength: 60 },
  senderHints: {
    deviceType: { type: String, default: "Unknown device" },
    browser: { type: String, default: "Unknown browser" },
    location: { type: String, default: "Not collected" },
    carrier: { type: String, default: "Not collected" },
    timestamp: { type: Date, default: Date.now }
  },
  senderHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default model<IMessage>("Message", messageSchema);
