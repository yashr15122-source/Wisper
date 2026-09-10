import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Instagram,
  Link2,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import { Message } from "../types";

type Platform = "instagram" | "snapchat" | "whatsapp" | "x";

type Props = {
  message: Message;
  username: string;
  close: () => void;
};

const platforms: {
  id: Platform;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    icon: <Instagram size={21} />,
  },
  {
    id: "snapchat",
    label: "Snapchat",
    icon: (
      <span className="text-[20px] font-black leading-none">
        👻
      </span>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <MessageCircle size={21} />,
  },
  {
    id: "x",
    label: "X",
    icon: <span className="text-lg font-black">𝕏</span>,
  },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);

  return lines;
}

async function createStoryImage(
  message: Message,
  username: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");

  canvas.width = 1080;
  canvas.height = 1920;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create image.");
  }

  // Background
  const gradient = ctx.createLinearGradient(
    0,
    0,
    1080,
    1920
  );

  gradient.addColorStop(0, "#111827");
  gradient.addColorStop(0.45, "#581c87");
  gradient.addColorStop(1, "#be185d");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Decorative circles
  ctx.globalAlpha = 0.16;

  ctx.beginPath();
  ctx.arc(100, 180, 220, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(1000, 1700, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // Whisper logo
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px Arial";
  ctx.fillText("Whisper", 80, 150);

  // Anonymous label
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "600 28px Arial";
  ctx.fillText("ANONYMOUS MESSAGE", 80, 215);

  // Message card
  const cardX = 70;
  const cardY = 430;
  const cardWidth = 940;
  const cardHeight = 760;

  ctx.fillStyle = "rgba(255,255,255,0.97)";

  const radius = 48;

  ctx.beginPath();
  ctx.roundRect(
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    radius
  );
  ctx.fill();

  // Message
  ctx.fillStyle = "#111827";
  ctx.font = "900 58px Arial";

  const maxTextWidth = 800;
  const lines = wrapText(
    ctx,
    message.content,
    maxTextWidth
  );

  const lineHeight = 78;
  const maxLines = 7;

  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines) {
    visibleLines[maxLines - 1] =
      `${visibleLines[maxLines - 1].slice(0, -3)}...`;
  }

  let textY =
    cardY +
    cardHeight / 2 -
    (visibleLines.length * lineHeight) / 2 +
    25;

  for (const line of visibleLines) {
    ctx.fillText(line, cardX + 70, textY);
    textY += lineHeight;
  }

  // Bottom text
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 30px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "Someone sent this anonymously 👀",
    540,
    1360
  );

  // Public link
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 40px Arial";

  ctx.fillText(
    `wisper.site/${username}`,
    540,
    1450
  );

  // Call to action
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 27px Arial";

  ctx.fillText(
    "Send me an anonymous message",
    540,
    1510
  );

  ctx.textAlign = "left";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create image."));
        }
      },
      "image/png",
      1
    );
  });
}

function TutorialPreview({
  step,
  shareLink,
}: {
  step: number;
  shareLink: string;
}) {
  if (step === 1) {
    return (
      <div className="relative flex h-[330px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-white" />
          <div className="absolute bottom-5 right-5 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative h-[250px] w-[145px] rounded-[28px] border-[6px] border-black bg-white shadow-2xl">
          <div className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 rounded-full bg-black" />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl">
              <span className="text-3xl font-light">+</span>
            </div>

            <div className="absolute -right-14 -top-7 whitespace-nowrap rounded-full bg-black px-3 py-2 text-xs font-bold text-white">
              Click +
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="relative flex h-[330px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
        <div className="relative h-[250px] w-[145px] rounded-[28px] border-[6px] border-black bg-white shadow-2xl">
          <div className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 rounded-full bg-black" />

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/90 px-4 py-3 text-white">
            <Link2 size={23} />

            <span className="text-xs font-bold">
              Link
            </span>
          </div>

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <div className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white shadow-lg">
              🔗 Link sticker
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="relative flex h-[330px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
        <div className="w-[300px] rounded-2xl bg-white p-5 shadow-2xl">
          <div className="mb-4 text-sm font-bold text-gray-800">
            Add link
          </div>

          <div className="rounded-xl border-2 border-purple-500 bg-gray-50 p-4 text-xs font-medium text-gray-700">
            {shareLink}
          </div>

          <div className="mt-4 rounded-xl bg-black py-3 text-center text-sm font-bold text-white">
            Done
          </div>

          <div className="mt-3 text-center text-xs font-semibold text-purple-600">
            Paste your Whisper link
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[330px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
      <div className="relative h-[250px] w-[145px] rotate-[-2deg] rounded-[28px] border-[6px] border-black bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl">
        <div className="absolute inset-4 rounded-[20px] border border-white/30" />

        <div className="absolute left-4 right-4 top-8 rounded-2xl bg-white p-4 text-center shadow-xl">
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Anonymous
          </div>

          <div className="mt-2 text-xs font-black leading-tight text-gray-900">
            Someone sent you
            <br />
            an anonymous message 👀
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[10px] font-black text-black shadow-lg">
          Your story is ready!
        </div>
      </div>

      <div className="absolute bottom-6 right-5 rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
        Share story →
      </div>
    </div>
  );
}

export default function ShareModal({
  message,
  username,
  close,
}: Props) {
  const storyRef = useRef<HTMLDivElement>(null);

  const [platform, setPlatform] =
    useState<Platform>("instagram");

  const [step, setStep] = useState(1);

  const [busy, setBusy] = useState(false);

  const [copied, setCopied] = useState(false);

  const shareLink = useMemo(
    () => `https://wisper.site/${username}`,
    [username]
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [close]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard may be blocked by browser permissions.
    }
  }

  async function downloadStory() {
    try {
      setBusy(true);

      const blob = await createStoryImage(
        message,
        username
      );

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "wisper-anonymous-message.png";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function shareStory() {
    try {
      setBusy(true);

      const blob = await createStoryImage(
        message,
        username
      );

      const file = new File(
        [blob],
        "wisper-anonymous-message.png",
        {
          type: "image/png",
        }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Whisper",
          text: `Send me an anonymous message 👀\n${shareLink}`,
          files: [file],
        });

        return;
      }

      await downloadStory();
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function shareWhatsApp() {
    const text = encodeURIComponent(
      `Send me an anonymous message 👀\n${shareLink}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function shareX() {
    const text = encodeURIComponent(
      "Someone sent me an anonymous message 👀"
    );

    const url = encodeURIComponent(shareLink);

    window.open(
      `https://twitter.com/intent/post?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handlePrimaryAction() {
    if (platform === "whatsapp") {
      await shareWhatsApp();
      return;
    }

    if (platform === "x") {
      await shareX();
      return;
    }

    await shareStory();
  }

  const isLastStep = step === 4;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={close}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="mx-auto my-3 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#f7f7f8] shadow-2xl sm:my-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-lg font-black text-gray-950 sm:text-xl">
              Share your message
            </h2>

            <p className="mt-0.5 text-xs font-medium text-gray-500">
              Share it with your friends
            </p>
          </div>

          <button
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Platform tabs */}
        <div className="overflow-x-auto bg-white px-4 py-4 sm:px-7">
          <div className="mx-auto flex w-max gap-2">
            {platforms.map((item) => {
              const active = platform === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPlatform(item.id);
                    setStep(1);
                  }}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition",
                    active
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {item.icon}

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instagram tutorial */}
        {platform === "instagram" && (
          <div className="px-4 pb-5 pt-5 sm:px-7">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-500">
                Step {step} of 4
              </div>

              <h3 className="mt-1 text-2xl font-black text-gray-950">
                {step === 1 &&
                  "Click the + button"}
                {step === 2 &&
                  "Click the Link sticker"}
                {step === 3 &&
                  "Paste your link"}
                {step === 4 &&
                  "Share your story!"}
              </h3>
            </div>

            {/* Step indicators */}
            <div className="mx-auto mt-5 flex max-w-[250px] items-center justify-center">
              {[1, 2, 3, 4].map((number) => (
                <div
                  key={number}
                  className="flex items-center"
                >
                  <button
                    onClick={() => setStep(number)}
                    className={[
                      "grid h-9 w-9 place-items-center rounded-full text-sm font-black transition",
                      number === step
                        ? "bg-black text-white"
                        : number < step
                        ? "bg-gray-300 text-gray-800"
                        : "bg-gray-200 text-gray-500",
                    ].join(" ")}
                  >
                    {number < step ? (
                      <Check size={17} />
                    ) : (
                      number
                    )}
                  </button>

                  {number !== 4 && (
                    <div
                      className={[
                        "h-1 w-8 rounded-full transition sm:w-12",
                        number < step
                          ? "bg-gray-400"
                          : "bg-gray-200",
                      ].join(" ")}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tutorial image */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -15,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                >
                  <TutorialPreview
                    step={step}
                    shareLink={shareLink}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Link */}
            <div className="mt-5 rounded-2xl border border-black/5 bg-white p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Whisper link
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 truncate rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-700">
                  {shareLink}
                </div>

                <button
                  onClick={copyLink}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black text-white transition hover:scale-105"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snapchat */}
        {platform === "snapchat" && (
          <div className="px-5 py-7 text-center sm:px-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-300 text-4xl shadow-lg">
              👻
            </div>

            <h3 className="mt-5 text-2xl font-black text-gray-950">
              Share on Snapchat
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Download your anonymous message story,
              then add it to your Snapchat story with
              your Whisper link.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4 text-left shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your link
              </div>

              <div className="mt-2 break-all text-sm font-bold text-gray-800">
                {shareLink}
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {platform === "whatsapp" && (
          <div className="px-5 py-7 text-center sm:px-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500 text-white shadow-lg">
              <MessageCircle size={40} />
            </div>

            <h3 className="mt-5 text-2xl font-black text-gray-950">
              Share on WhatsApp
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Send your Whisper link directly to your
              friends or WhatsApp status.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4 text-left shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Message
              </div>

              <div className="mt-2 text-sm font-semibold text-gray-800">
                Send me an anonymous message 👀
              </div>

              <div className="mt-1 break-all text-sm font-bold text-purple-600">
                {shareLink}
              </div>
            </div>
          </div>
        )}

        {/* X */}
        {platform === "x" && (
          <div className="px-5 py-7 text-center sm:px-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-black text-white shadow-lg">
              <span className="text-4xl font-black">
                𝕏
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-black text-gray-950">
              Share on X
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Post your Whisper link and let your followers
              send you anonymous messages.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4 text-left shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Post preview
              </div>

              <div className="mt-2 text-sm font-semibold text-gray-800">
                Someone sent me an anonymous message 👀
              </div>

              <div className="mt-1 break-all text-sm font-bold text-purple-600">
                {shareLink}
              </div>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="border-t border-black/5 bg-white px-4 py-4 sm:px-7">
          {platform === "instagram" ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setStep((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={step === 1}
                className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={17} />
                <span className="hidden sm:inline">
                  Back
                </span>
              </button>

              {!isLastStep ? (
                <button
                  onClick={() =>
                    setStep((current) =>
                      Math.min(4, current + 1)
                    )
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.01]"
                >
                  Next Step
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  onClick={handlePrimaryAction}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
                >
                  <Instagram size={18} />

                  {busy
                    ? "Preparing..."
                    : "Share on Instagram"}
                </button>
              )}

              <button
                onClick={downloadStory}
                disabled={busy}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                title="Download story"
              >
                <Download size={19} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={downloadStory}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3.5 text-sm font-bold text-gray-800 transition hover:bg-gray-200 disabled:opacity-50"
              >
                <Download size={18} />
                Download
              </button>

              <button
                onClick={handlePrimaryAction}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-black text-white transition hover:scale-[1.01] disabled:opacity-60"
              >
                {platform === "whatsapp" && (
                  <MessageCircle size={18} />
                )}

                {platform === "x" && (
                  <span className="text-lg">𝕏</span>
                )}

                {platform === "snapchat" && (
                  <span>👻</span>
                )}

                {busy
                  ? "Preparing..."
                  : `Share on ${
                      platform === "whatsapp"
                        ? "WhatsApp"
                        : platform === "x"
                        ? "X"
                        : "Snapchat"
                    }`}
              </button>
            </div>
          )}

          {/* Close */}
          <button
            onClick={close}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-sm font-bold text-gray-500 transition hover:text-gray-900"
          >
            <X size={16} />
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
