import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const publicUser = (u: any) => ({
  id: u._id,
  username: u.username,
  email: u.email,
  customPrompt: u.customPrompt,
  isAcceptingMessages: u.isAcceptingMessages,
  createdAt: u.createdAt
});

function setCookie(res: Response, userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.cookie("ngl_token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req: Request, res: Response) {
  const username = String(req.body.username ?? "").trim().toLowerCase();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  if (!/^[a-z0-9_]{3,30}$/.test(username)) return res.status(400).json({ message: "Username must be 3-30 characters: letters, numbers, underscore." });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (await User.exists({ $or: [{ username }, { email }] })) return res.status(409).json({ message: "Username or email already exists." });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hash });
  setCookie(res, user.id);
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const identifier = String(req.body.identifier ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials." });
  setCookie(res, user.id);
  res.json({ user: publicUser(user) });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("ngl_token");
  res.json({ message: "Logged out" });
}
