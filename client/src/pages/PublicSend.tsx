import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Dice5, Send, Sparkles, Instagram } from "lucide-react";
import { api } from "../services/api";

const prompts = [
  "What do you really think about me?",
  "Tell me a secret 👀",
  "Three words to describe me",
  "Who is your current crush?",
  "What should I improve?",
  "Give me your most honest opinion"
];

export default function PublicSend() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname;
  const username = decodeURIComponent(path.startsWith(base) ? path.slice(base.length) : path)
    .replace(/^\/+|\/+$/g, "")
    .split("/")[0]
    .toLowerCase();

  const [profile, setProfile] = useState<any>();
  const [content, setContent] = useState("");
  const [instagram, setInstagram] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/users/public/${username}`)
      .then(r => setProfile(r.data))
      .catch(e => setError(e.response?.data?.message || "Profile not found"));
  }, [username]);

  function randomPrompt() {
    setContent(prompts[Math.floor(Math.random() * prompts.length)]);
  }

  async function send() {
    if (!content.trim()) return;
    setError("");
    try {
      await api.post(`/messages/${username}`, {
        content,
        instagramUsername: instagram.trim() || undefined
      });
      setSent(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: .65 } });
    } catch (e: any) {
      setError(e.response?.data?.message || "Could not send message");
    }
  }

  if (error) return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="glass rounded-3xl p-8 text-center"><h1 className="text-2xl font-bold">{error}</h1></div>
    </main>
  );

  if (!profile) return <main className="grid min-h-screen place-items-center text-white/60">Loading…</main>;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center p-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 text-3xl font-black shadow-2xl">@</div>
          <h1 className="text-3xl font-black">@{profile.username}</h1>
          <p className="mt-2 text-white/50">{profile.customPrompt}</p>
        </div>

        {!profile.isAcceptingMessages ? (
          <div className="glass rounded-3xl p-8 text-center text-white/70">This inbox is paused right now.</div>
        ) : sent ? (
          <div className="glass rounded-3xl p-10 text-center">
            <Sparkles className="mx-auto mb-4 text-fuchsia-300" size={42} />
            <h2 className="text-3xl font-black">Message sent!</h2>
            <p className="mt-2 text-white/50">Your message was sent anonymously.</p>
            <button onClick={() => { setSent(false); setContent(""); setInstagram(""); }} className="mt-7 rounded-2xl bg-white/10 px-6 py-3 font-semibold">Send another</button>
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-white/40">Anonymous message</span>
              <button onClick={randomPrompt} className="rounded-xl bg-white/10 p-2 hover:bg-white/15" title="Random prompt"><Dice5 size={19} /></button>
            </div>

            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 500))}
              placeholder="Write something honest…"
              rows={6}
              className="w-full resize-none bg-transparent p-1 text-xl outline-none placeholder:text-white/20"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-white/35">
              <span>{content.length}/500</span><span>Identity hidden</span>
            </div>

            <div className="mt-5 rounded-2xl bg-white/5 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                <Instagram size={17} className="text-pink-300" />
                Optional Instagram username
              </label>
              <input
                value={instagram}
                onChange={e => setInstagram(e.target.value.slice(0, 31))}
                placeholder="@yourusername"
                className="w-full rounded-xl bg-black/20 p-3 outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
              <p className="mt-2 text-xs leading-relaxed text-white/35">
                Only share this if you want the recipient to potentially see it as a premium hint. It is self-reported and does not verify your identity.
              </p>
            </div>

            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

            <button disabled={!content.trim()} onClick={send} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 p-4 font-bold disabled:opacity-40">
              <Send className="mr-2 inline" size={18} />Send anonymously
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/25">Powered by Whisper • Be kind.</p>
      </motion.div>
    </main>
  );
}
