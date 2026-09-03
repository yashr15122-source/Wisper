import { Request, Response, NextFunction } from "express";

const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "motherfucker"
];

function containsBlockedWord(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  return normalized.split(/\s+/).some(word => BLOCKED_WORDS.includes(word));
}

export function moderateMessage(req: Request, res: Response, next: NextFunction) {
  const content = String(req.body?.content ?? "").trim();

  if (!content) return res.status(400).json({ message: "Message cannot be empty." });
  if (content.length > 500) return res.status(400).json({ message: "Message cannot exceed 500 characters." });
  if (containsBlockedWord(content)) return res.status(400).json({ message: "Please keep your message respectful." });

  req.body.content = content;
  next();
}
