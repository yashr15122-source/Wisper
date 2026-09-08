import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Shield, Share2 } from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#080812] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <MessageCircle className="h-4 w-4" />
            Anonymous messaging made simple
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Send & Receive
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anonymous Messages
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
            Create your own anonymous message link, share it with friends,
            followers, or your audience, and discover what people really want
            to say.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-black transition hover:scale-105"
            >
              Create Your Anonymous Link
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/auth"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <MessageCircle className="mb-5 h-8 w-8 text-purple-400" />
            <h2 className="text-xl font-bold">Anonymous Messages</h2>
            <p className="mt-3 leading-7 text-white/60">
              Receive honest messages without revealing who sent them.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <Share2 className="mb-5 h-8 w-8 text-pink-400" />
            <h2 className="text-xl font-bold">Share Your Link</h2>
            <p className="mt-3 leading-7 text-white/60">
              Share your personal anonymous message link with friends,
              followers, Instagram, WhatsApp, or anywhere else.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <Shield className="mb-5 h-8 w-8 text-purple-400" />
            <h2 className="text-xl font-bold">Simple & Private</h2>
            <p className="mt-3 leading-7 text-white/60">
              Send messages quickly and keep the focus on what people have to
              say.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-black sm:text-4xl">
            How Whisper Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center text-white/60">
            Create your anonymous message link in a few simple steps.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-6">
              <div className="mb-4 text-3xl font-black text-purple-400">01</div>
              <h3 className="text-lg font-bold">Create your link</h3>
              <p className="mt-2 text-white/60">
                Sign up and create your personal Whisper link.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-6">
              <div className="mb-4 text-3xl font-black text-pink-400">02</div>
              <h3 className="text-lg font-bold">Share it</h3>
              <p className="mt-2 text-white/60">
                Put your anonymous message link in your social profile or
                share it directly with friends.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-6">
              <div className="mb-4 text-3xl font-black text-purple-400">03</div>
              <h3 className="text-lg font-bold">Receive messages</h3>
              <p className="mt-2 text-white/60">
                People can send you anonymous messages through your link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-black sm:text-4xl">
            What is anonymous messaging?
          </h2>

          <div className="mt-6 space-y-5 text-base leading-8 text-white/65">
            <p>
              Anonymous messaging allows people to send messages without
              displaying their identity to the recipient. Whisper makes it
              easy to create an anonymous message link and share it with your
              friends, followers, and audience.
            </p>

            <p>
              Your personal Whisper link can be shared on social media,
              messaging apps, websites, or anywhere you want people to send
              you a message. It is a simple way to open conversations and hear
              what people want to say anonymously.
            </p>

            <p>
              Whether you want anonymous questions, honest feedback, or
              messages from your followers, Whisper gives you a simple
              anonymous inbox for receiving messages through your personal
              link.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-black sm:text-5xl">
            Ready to hear what people really think?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Create your anonymous message link and start receiving messages.
          </p>

          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-black transition hover:scale-105"
          >
            Create Your Whisper Link
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Whisper. Anonymous messaging made simple.
      </footer>
    </main>
  );
}
