import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Copy, LogOut, Settings, Share2, Crown, Zap } from "lucide-react";
import { io } from "socket.io-client";
import { api, SOCKET_URL } from "../services/api";
import { User, Message } from "../types";
import MessageCard from "../components/MessageCard";
import ShareModal from "../components/ShareModal";
import HintModal from "../components/HintModal";
import { useNavigate } from "react-router-dom";

const publicBase = () => {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  return `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, "");
};

async function loadRazorpay() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(script);
  });
}

export default function Dashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Message | null>(null);
  const [share, setShare] = useState<Message | null>(null);
  const [hint, setHint] = useState<Message | null>(null);
  const [prompt, setPrompt] = useState("");
  const [accept, setAccept] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveText, setSaveText] = useState("Save");
  const [paying, setPaying] = useState<"hint" | "boost" | null>(null);
  const [payError, setPayError] = useState("");

  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data.user as User
  });

  const messages = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await api.get("/users/messages")).data.messages as Message[]
  });

  useEffect(() => {
    if (!me.data) return;
    setPrompt(me.data.customPrompt);
    setAccept(me.data.isAcceptingMessages);
    const s = io(SOCKET_URL, { withCredentials: true });
    s.on("message:new", () => qc.invalidateQueries({ queryKey: ["messages"] }));
    return () => { s.disconnect(); };
  }, [me.data, qc]);

  if (me.isLoading) return <div className="grid min-h-screen place-items-center text-white/50">Loading…</div>;
  if (me.isError) { nav("/auth"); return null; }

  const user = me.data!;

  async function save() {
    setSaveText("Saving…");
    try {
      await api.patch("/users/profile", { customPrompt: prompt, isAcceptingMessages: accept });
      await qc.invalidateQueries({ queryKey: ["me"] });
      setSaveText("Saved ✓");
      setTimeout(() => setSaveText("Save"), 1500);
    } catch {
      setSaveText("Failed");
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    nav("/auth");
  }

  async function copy() {
    await navigator.clipboard.writeText(`${publicBase()}/${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function opened(m: Message) {
    await api.patch(`/users/messages/${m._id}/open`);
    setSelected(m);
    qc.invalidateQueries({ queryKey: ["messages"] });
  }

  async function pay(product: "hint" | "boost", message: Message) {
    setPayError("");
    setPaying(product);
    try {
      await loadRazorpay();
      const order = (await api.post("/payments/create-order", {
        product,
        messageId: message._id
      })).data;

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Whisper",
          description: product === "hint" ? "Premium sender hint" : "Boost anonymous message",
          order_id: order.orderId,
          prefill: { email: user.email },
          theme: { color: "#d946ef" },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          handler: async response => {
            try {
              await api.post("/payments/verify", response);
              resolve();
            } catch (e: any) {
              reject(new Error(e.response?.data?.message || "Payment verification failed"));
            }
          }
        });
        checkout.open();
      });

      await qc.invalidateQueries({ queryKey: ["messages"] });
      if (product === "hint") {
        setHint({ ...message, hintUnlocked: true });
      } else {
        setSelected(current => current ? { ...current, isBoosted: true } : current);
      }
    } catch (e: any) {
      if (e?.message !== "Payment cancelled") setPayError(e?.message || "Payment failed.");
    } finally {
      setPaying(null);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">Your anonymous inbox</p>
            <h1 className="text-4xl font-black gradient-text">Hey, @{user.username} ✦</h1>
          </div>
          <button onClick={logout} className="rounded-xl bg-white/10 px-4 py-2"><LogOut size={18} /></button>
        </header>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-7 shadow-2xl">
            <p className="text-sm font-semibold text-white/70">YOUR LINK</p>
            <p className="mt-3 break-all text-2xl font-black">{publicBase()}/{user.username}</p>
            <button onClick={copy} className="mt-6 rounded-2xl bg-white px-5 py-3 font-bold text-black">
              <Copy className="mr-2 inline" size={18} />{copied ? "Copied!" : "Copy link"}
            </button>
          </div>

          <div className="glass rounded-[2rem] p-7">
            <div className="mb-4 flex items-center gap-2"><Settings size={19} /><h2 className="font-bold">Inbox settings</h2></div>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value.slice(0, 120))} rows={2} className="w-full rounded-2xl bg-white/10 p-4 outline-none focus:ring-2 focus:ring-fuchsia-400" />
            <label className="mt-4 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} /> Accept incoming messages
            </label>
            <button onClick={save} className="mt-4 rounded-xl bg-white/10 px-4 py-2 font-semibold">{saveText}</button>
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between">
          <div><h2 className="text-2xl font-bold">Inbox</h2><p className="text-sm text-white/40">{messages.data?.length || 0} messages</p></div>
          <button onClick={copy} className="rounded-xl bg-white/10 px-4 py-2 text-sm"><Share2 className="mr-2 inline" size={16} />Share</button>
        </div>

        {payError && <div className="mb-5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">{payError}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {messages.data?.map(m => (
            <MessageCard
              key={m._id}
              message={m}
              onOpen={() => opened(m)}
              onFavorite={async () => { await api.patch(`/users/messages/${m._id}/favorite`); qc.invalidateQueries({ queryKey: ["messages"] }); }}
              onDelete={async () => { await api.delete(`/users/messages/${m._id}`); qc.invalidateQueries({ queryKey: ["messages"] }); }}
            />
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-8"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Anonymous</p>
                {selected.isBoosted && <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100"><Zap size={13} className="mr-1 inline" />Boosted</span>}
              </div>
              <p className="mt-5 text-3xl font-black">{selected.content}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button onClick={() => setShare(selected)} className="rounded-2xl bg-white px-4 py-3 font-bold text-black">Share to story</button>
                <button onClick={() => setHint(selected)} className="rounded-2xl bg-black/20 px-4 py-3 font-bold">
                  <Crown size={17} className="mr-1 inline" />{selected.hintUnlocked ? "View premium hint" : "Unlock sender hint"}
                </button>
                {!selected.isBoosted && (
                  <button onClick={() => pay("boost", selected)} disabled={paying !== null} className="sm:col-span-2 rounded-2xl bg-amber-300/20 px-4 py-3 font-bold text-amber-100 disabled:opacity-50">
                    <Zap size={17} className="mr-1 inline" />{paying === "boost" ? "Opening payment…" : "Boost message • ₹29"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {share && <ShareModal message={share} close={() => setShare(null)} />}
        {hint && <HintModal message={hint} close={() => setHint(null)} onPay={() => pay("hint", hint)} />}
      </div>
    </main>
  );
}
