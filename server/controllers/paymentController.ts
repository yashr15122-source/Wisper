import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Message from "../models/Message";
import Payment, { PaymentProduct } from "../models/Payment";
import { AuthRequest } from "../middleware/auth";

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env"
    );
  }

  return { keyId, keySecret };
}

function getRazorpay() {
  const { keyId, keySecret } = getRazorpayConfig();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function priceFor(product: PaymentProduct) {
  const price =
    product === "hint"
      ? Number(process.env.HINT_PRICE_INR || 49)
      : Number(process.env.BOOST_PRICE_INR || 29);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Invalid premium price configuration.");
  }

  return price;
}

/**
 * CREATE RAZORPAY ORDER
 */
export async function createOrder(
  req: AuthRequest,
  res: Response
) {
  try {
    const product = String(req.body?.product || "") as PaymentProduct;
    const messageId = String(req.body?.messageId || "").trim();

    console.log("Premium payment request:", {
      product,
      messageId,
      userId: req.userId,
    });

    if (!req.userId) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    if (product !== "hint" && product !== "boost") {
      return res.status(400).json({
        message: "Invalid premium product.",
      });
    }

    if (!messageId) {
      return res.status(400).json({
        message: "Message ID is required.",
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      recipientId: req.userId,
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    if (product === "hint" && message.hintUnlocked) {
      return res.status(409).json({
        message: "Sender hint is already unlocked.",
      });
    }

    if (product === "boost" && message.isBoosted) {
      return res.status(409).json({
        message: "This message is already boosted.",
      });
    }

    const priceInr = priceFor(product);
    const amountInPaise = Math.round(priceInr * 100);

    if (amountInPaise < 100) {
      return res.status(500).json({
        message: "Premium price must be at least ₹1.",
      });
    }

    const { keyId } = getRazorpayConfig();

    console.log("Creating Razorpay order:", {
      amount: amountInPaise,
      currency: "INR",
      product,
    });

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `msg_${message.id}_${Date.now()}`,
      notes: {
        product,
        messageId: message.id,
        userId: String(req.userId),
      },
    });

    console.log("Razorpay order created:", order.id);

    await Payment.create({
      userId: req.userId,
      messageId: message.id,
      product,
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      keyId,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      product,
    });
  } catch (error: any) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      message:
        error?.error?.description ||
        error?.description ||
        error?.message ||
        "Unable to create Razorpay order.",
    });
  }
}

/**
 * VERIFY RAZORPAY PAYMENT
 */
export async function verifyPayment(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Incomplete Razorpay payment response.",
      });
    }

    const { keySecret } = getRazorpayConfig();

    const payment = await Payment.findOne({
      razorpayOrderId: String(razorpay_order_id),
      userId: req.userId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment order not found.",
      });
    }

    if (payment.status === "paid") {
      return res.json({
        verified: true,
        product: payment.product,
        messageId: payment.messageId,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${String(razorpay_order_id)}|${String(
          razorpay_payment_id
        )}`
      )
      .digest("hex");

    const receivedSignature = String(razorpay_signature);

    const expectedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      receivedSignature,
      "utf8"
    );

    const valid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!valid) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    const message = await Message.findOne({
      _id: payment.messageId,
      recipientId: req.userId,
    });

    if (!message) {
      return res.status(404).json({
        message: "Message no longer exists.",
      });
    }

    payment.razorpayPaymentId = String(
      razorpay_payment_id
    );

    payment.razorpaySignature = receivedSignature;
    payment.status = "paid";

    await payment.save();

    if (payment.product === "hint") {
      message.hintUnlocked = true;
    }

    if (payment.product === "boost") {
      message.isBoosted = true;
    }

    await message.save();

    console.log("Payment verified successfully:", {
      paymentId: razorpay_payment_id,
      product: payment.product,
      messageId: message.id,
    });

    return res.json({
      verified: true,
      product: payment.product,
      messageId: message.id,
    });
  } catch (error: any) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return res.status(500).json({
      message:
        error?.error?.description ||
        error?.description ||
        error?.message ||
        "Payment verification failed.",
    });
  }
}

/**
 * GET PREMIUM HINT
 */
export async function getPremiumHint(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      recipientId: req.userId,
    }).lean();

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    if (!message.hintUnlocked) {
      return res.status(402).json({
        message: "Premium sender hint is locked.",
        product: "hint",
        priceInr: Number(
          process.env.HINT_PRICE_INR || 49
        ),
      });
    }

    return res.json({
      messageId: message._id,
      deviceType:
        message.senderHints?.deviceType ||
        "Unknown device",

      browser:
        message.senderHints?.browser ||
        "Unknown browser",

      location:
        message.senderHints?.location ||
        "Not collected",

      carrier:
        message.senderHints?.carrier ||
        "Not collected",

      timestamp:
        message.senderHints?.timestamp ||
        message.createdAt,

      instagramUsername:
        message.senderInstagram || null,

      disclaimer:
        "Hints are non-identifying and may be approximate. An optional Instagram username is self-reported by the sender and does not prove identity.",
    });
  } catch (error: any) {
    console.error("GET PREMIUM HINT ERROR:", error);

    return res.status(500).json({
      message:
        error?.message ||
        "Unable to retrieve premium hint.",
    });
  }
}