import { motion } from "framer-motion";
import { Heart, Trash2, Eye, Crown, Zap } from "lucide-react";
import { Message } from "../types";

export default function MessageCard({
  message, onOpen, onFavorite, onDelete
}: {
  message: Message;
  onOpen: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-3xl p-5 ${!message.isOpened ? "ring-1 ring-fuchsia-400/40" : ""} ${message.isBoosted ? "ring-2 ring-amber-300/50" : ""}`}>
      <button className="w-full text-left" onClick={onOpen}>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-white/50">
          <span className="flex items-center gap-2">
            Anonymous
            {message.isBoosted && <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-200"><Zap size={12} className="mr-1 inline" />Boosted</span>}
          </span>
          <span>{new Date(message.createdAt).toLocaleString()}</span>
        </div>
        <p className="line-clamp-4 text-lg leading-relaxed text-white/90">{message.content}</p>
      </button>
      <div className="mt-4 flex gap-2">
        <button onClick={onOpen} className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"><Eye size={16} className="mr-1 inline" />Open</button>
        <button onClick={onFavorite} className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"><Heart size={16} className={`mr-1 inline ${message.isFavorited ? "fill-pink-400 text-pink-400" : ""}`} /></button>
        <button onClick={onDelete} className="ml-auto rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-red-500/20"><Trash2 size={16} /></button>
      </div>
    </motion.div>
  );
}
