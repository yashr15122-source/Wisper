import { useRef } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Message } from "../types";

export default function ShareModal({ message, close }: { message: Message; close:()=>void }) {
  const ref = useRef<HTMLDivElement>(null);
  async function exportCard() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#11111f" });
    const a = document.createElement("a"); a.download = "anonymous-message.png"; a.href = canvas.toDataURL("image/png"); a.click();
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={close}>
    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
      <div ref={ref} className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-8 shadow-2xl">
        <div className="mb-12 text-sm font-semibold uppercase tracking-widest text-white/70">Anonymous message</div>
        <p className="text-3xl font-black leading-tight">{message.content}</p>
        <div className="mt-12 text-sm text-white/70">Someone sent this anonymously 👀</div>
      </div>
      <div className="mt-4 flex gap-3"><button onClick={exportCard} className="flex-1 rounded-2xl bg-white px-5 py-3 font-bold text-black"><Download className="mr-2 inline" size={18}/>Download</button><button onClick={close} className="rounded-2xl bg-white/10 px-5 py-3"><X/></button></div>
    </motion.div>
  </div>;
}
