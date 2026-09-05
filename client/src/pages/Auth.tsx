import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [register, setRegister] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (register) {
        await api.post("/auth/register", { username, email, password });
      } else {
        await api.post("/auth/login", { identifier, password });
      }
      nav("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-5">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="glass w-full max-w-md rounded-[2rem] p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-2xl">✦</div>
          <h1 className="text-4xl font-black gradient-text">Whisper</h1>
          <p className="mt-2 text-white/50">{register ? "Create your anonymous inbox" : "Welcome back"}</p>
        </div>
        {register ? (
          <>
            <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="mb-3 w-full rounded-2xl bg-white/10 p-4 outline-none ring-fuchsia-400 focus:ring-2" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="mb-3 w-full rounded-2xl bg-white/10 p-4 outline-none focus:ring-2 focus:ring-fuchsia-400" />
          </>
        ) : (
          <input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Username or email" className="mb-3 w-full rounded-2xl bg-white/10 p-4 outline-none focus:ring-2 focus:ring-fuchsia-400" />
        )}
        <div className="relative mb-3">
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (8+ characters)"
            className="w-full rounded-2xl bg-white/10 p-4 outline-none focus:ring-2 focus:ring-fuchsia-400 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <p className="mb-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 p-4 font-bold">{register ? "Create account" : "Log in"}</button>
        <button type="button" onClick={() => setRegister(!register)} className="mt-5 w-full text-sm text-white/50 hover:text-white">{register ? "Already have an account? Log in" : "Need an account? Register"}</button>
      </motion.form>
    </main>
  );
}
