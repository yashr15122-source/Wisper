import { Response } from "express";
import User from "../models/User";
import Message from "../models/Message";
import { AuthRequest } from "../middleware/auth";

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: { id: user.id, username: user.username, email: user.email, customPrompt: user.customPrompt, isAcceptingMessages: user.isAcceptingMessages, isAdmin: user.isAdmin, createdAt: user.createdAt } });
}

export async function publicProfile(req: AuthRequest, res: Response) {
  const username = String(req.params.username).toLowerCase();
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "Profile not found" });
  res.json({ username: user.username, customPrompt: user.customPrompt, isAcceptingMessages: user.isAcceptingMessages });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (typeof req.body.customPrompt === "string") user.customPrompt = req.body.customPrompt.trim().slice(0, 120) || "send me anonymous messages!";
  if (typeof req.body.isAcceptingMessages === "boolean") user.isAcceptingMessages = req.body.isAcceptingMessages;
  await user.save();
  res.json({ user: { id: user.id, username: user.username, email: user.email, customPrompt: user.customPrompt, isAcceptingMessages: user.isAcceptingMessages, isAdmin: user.isAdmin, createdAt: user.createdAt } });
}

export async function inbox(req: AuthRequest, res: Response) {
  const messages = await Message.find({ recipientId: req.userId })
    .sort({ isBoosted: -1, createdAt: -1 })
    .lean();
  res.json({ messages });
}

export async function markOpened(req: AuthRequest, res: Response) {
  const message = await Message.findOneAndUpdate({ _id: req.params.id, recipientId: req.userId }, { isOpened: true }, { new: true });
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.json({ message });
}

export async function toggleFavorite(req: AuthRequest, res: Response) {
  const message = await Message.findOne({ _id: req.params.id, recipientId: req.userId });
  if (!message) return res.status(404).json({ message: "Message not found" });
  message.isFavorited = !message.isFavorited;
  await message.save();
  res.json({ message });
}

export async function deleteMessage(req: AuthRequest, res: Response) {
  const result = await Message.deleteOne({ _id: req.params.id, recipientId: req.userId });
  if (!result.deletedCount) return res.status(404).json({ message: "Message not found" });
  res.json({ message: "Deleted" });
}

export async function adminGetUserMessages(req: AuthRequest, res: Response) {
  if (!req.isAdmin) return res.status(403).json({ message: "Admin access required" });
  
  const targetUserId = req.params.userId;
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return res.status(404).json({ message: "Target user not found" });

  const messages = await Message.find({ recipientId: targetUserId })
    .sort({ isBoosted: -1, createdAt: -1 })
    .lean();
  
  res.json({ 
    user: { id: targetUser.id, username: targetUser.username, email: targetUser.email, customPrompt: targetUser.customPrompt, isAcceptingMessages: targetUser.isAcceptingMessages, createdAt: targetUser.createdAt },
    messages 
  });
}

export async function adminGetAllUsers(req: AuthRequest, res: Response) {
  if (!req.isAdmin) return res.status(403).json({ message: "Admin access required" });
  
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
  res.json({ users });
}
