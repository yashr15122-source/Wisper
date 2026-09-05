import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOut, Users, MessageSquare, Eye, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import { User, Message } from "../types";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const users = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => (await api.get("/users/admin/users")).data.users as User[],
  });

  useEffect(() => {
    if (selectedUser) {
      loadUserMessages(selectedUser._id);
    }
  }, [selectedUser]);

  async function loadUserMessages(userId: string) {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/users/admin/users/${userId}/messages`);
      setUserMessages(res.data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    nav("/auth");
  }

  if (users.isLoading) return <div className="grid min-h-screen place-items-center text-white/50">Loading…</div>;
  if (users.isError) { nav("/auth"); return null; }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-rose-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">Admin Panel</p>
            <h1 className="text-4xl font-black gradient-text">Admin Dashboard ✦</h1>
          </div>
          <button onClick={logout} className="rounded-xl bg-white/10 px-4 py-2"><LogOut size={18} /></button>
        </header>

        {selectedUser ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedUser(null)} className="rounded-xl bg-white/10 px-4 py-2"><ArrowLeft size={18} /> Back to Users</button>
              <div>
                <h2 className="text-2xl font-bold">@{selectedUser.username}</h2>
                <p className="text-sm text-white/40">{selectedUser.email} • {selectedUser._id}</p>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-7">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold"><MessageSquare size={19} className="mr-2 inline" />Messages ({userMessages.length})</h2>
              </div>
              {loadingMessages ? (
                <div className="grid place-items-center py-8 text-white/50">Loading messages…</div>
              ) : userMessages.length === 0 ? (
                <div className="text-center py-8 text-white/40">No messages yet</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userMessages.map(m => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-white/80">{m.content}</p>
                        <span className="text-xs text-white/40">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 text-sm text-white/50 space-y-1">
                        <p><strong>Prompt:</strong> {m.prompt}</p>
                        <p><strong>Device:</strong> {m.senderHints?.deviceType}</p>
                        <p><strong>Browser:</strong> {m.senderHints?.browser}</p>
                        <p><strong>Opened:</strong> {m.isOpened ? "Yes" : "No"}</p>
                        <p><strong>Favorited:</strong> {m.isFavorited ? "Yes" : "No"}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold"><Users size={19} className="mr-2 inline" />All Users ({users.data?.length || 0})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-sm text-white/50">
                    <th className="pb-3">Username</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Admin</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 font-mono">@{u.username}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.isAdmin ? <span className="text-green-400">Yes</span> : <span className="text-white/40">No</span>}</td>
                      <td className="py-3 text-sm text-white/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="rounded-xl bg-fuchsia-600 px-4 py-1.5 text-sm font-semibold hover:bg-fuchsia-500"
                        >
                          <Eye size={15} className="mr-1 inline" />View Messages
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}