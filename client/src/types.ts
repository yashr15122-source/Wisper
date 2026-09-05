export type User = {
  _id: string;
  id: string;
  username: string;
  email: string;
  customPrompt: string;
  isAcceptingMessages: boolean;
  isAdmin?: boolean;
  createdAt: string;
};

export type Message = {
  _id: string;
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
    timestamp: string;
  };
  createdAt: string;
};

export type PremiumHint = {
  messageId: string;
  deviceType: string;
  browser: string;
  location: string;
  carrier: string;
  timestamp: string;
  instagramUsername: string | null;
  disclaimer: string;
};
