import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import Message from "../models/Message";

function deviceType(ua: string) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other device";
}

function browser(ua: string) {
  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/Chrome\//i.test(ua)) return "Google Chrome";
  if (/Firefox\//i.test(ua)) return "Mozilla Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Unknown browser";
}

function hashedSender(req: Request) {
  const raw = `${req.ip}|${req.headers["user-agent"] ?? "unknown"}`;
  return crypto.createHash("sha256").update(raw + process.env.JWT_SECRET).digest("hex");
}

function cleanInstagram(value: unknown) {
  if (typeof value !== "string") return undefined;
  const valueTrimmed = value.trim().replace(/^@+/, "");
  if (!valueTrimmed) return undefined;
  if (!/^[A-Za-z0-9._]{1,30}$/.test(valueTrimmed)) return undefined;
  return `@${valueTrimmed}`;
}

export async function sendMessage(req: Request, res: Response) {
  const username = String(req.params.username).toLowerCase();
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "Profile not found" });
  if (!user.isAcceptingMessages) {
    return res.status(403).json({ message: "This user is not accepting messages right now." });
  }

  const content = String(req.body.content).trim();
  const ua = String(req.headers["user-agent"] ?? "");
  const instagram = cleanInstagram(req.body.instagramUsername);

  if (req.body.instagramUsername && !instagram) {
    return res.status(400).json({ message: "Enter a valid Instagram username, for example @username." });
  }

  const message = await Message.create({
    recipientId: user._id,
    content,
    prompt: user.customPrompt,
    senderInstagram: instagram,
    senderHash: hashedSender(req),
    senderHints: {
      deviceType: deviceType(ua),
      browser: browser(ua),
      location: "Not collected",
      carrier: "Not collected",
      timestamp: new Date()
    }
  });

  const io = (req.app as any).io;
  io?.to(`user:${user.id}`).emit("message:new", {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    isBoosted: false
  });

  res.status(201).json({ message: "Sent anonymously" });
}
