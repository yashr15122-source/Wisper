import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Smartphone, MapPin, Clock, Globe2, Radio, Instagram, Crown } from "lucide-react";
import { api } from "../services/api";
import { Message, PremiumHint } from "../types";

export default function HintModal({ message, close, onPay }: {
  message: Message;
  close: () => void;
  onPay: () => void;
}) {
  const [hint, setHint] = useState<PremiumHint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!message.hintUnlocked) {
      setLoading(false);
      return;
    }
    api.get(`/payments/hint/${message._id}`)
      .then(r => setHint(r.data))
      .finally(() => setLoading(false));
  }, [message._id, message.hintUnlocked]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={close}>
      <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass w-full max-w-md rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold"><Crown className="text-amber-300" /> Premium hint</h2>
          <button onClick={close}><X /></button>
        </div>

        {!message.hintUnlocked ? (
          <>
            <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 p-5">
              <p className="font-semibold">Unlock sender hints</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">See non-identifying device and browser details, timestamp, and the optional Instagram username supplied by the sender.</p>
            </div>
            <button onClick={onPay} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 p-4 font-bold">Unlock for ₹49</button>
            <p className="mt-3 text-center text-xs text-white/30">Payment is processed securely by Razorpay.</p>
          </>
        ) : loading ? (
          <p className="text-white/50">Loading hint…</p>
        ) : hint ? (
          <div className="space-y-3 text-white/80">
            <p><Smartphone className="mr-3 inline text-fuchsia-300" />{hint.deviceType}</p>
            <p><Globe2 className="mr-3 inline text-blue-300" />{hint.browser}</p>
            <p><MapPin className="mr-3 inline text-pink-300" />{hint.location}</p>
            <p><Radio className="mr-3 inline text-violet-300" />{hint.carrier}</p>
            <p><Clock className="mr-3 inline text-violet-300" />{new Date(hint.timestamp).toLocaleString()}</p>
            {hint.instagramUsername ? (
              <p><Instagram className="mr-3 inline text-pink-300" />{hint.instagramUsername}</p>
            ) : (
              <p className="text-sm text-white/40">No Instagram username was provided by the sender.</p>
            )}
            <p className="mt-5 text-xs leading-relaxed text-white/40">{hint.disclaimer}</p>
          </div>
        ) : (
          <p className="text-red-300">Unable to load the premium hint.</p>
        )}
      </motion.div>
    </div>
  );
}
