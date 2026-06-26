import { useEffect, useRef } from "react";
import { Sparkles, X, Clock } from "lucide-react";
import {
  useAgentStore,
  closeAgent,
  toggleAgent,
  resetStatus,
} from "#/lib/agent/store";
import { useAgentActions } from "./useAgentActions";
import { AgentMessage } from "./AgentMessage";
import { AgentComposer } from "./AgentComposer";

export function AgentDock() {
  const { messages, status, open, retryAfterMs } = useAgentStore();
  const { sendMessage } = useAgentActions();
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragY = useRef(0);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Close on Escape (only when no other overlay is open).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAgent();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Swipe-to-dismiss on mobile (drag handle).
  const onHandleStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
    dragY.current = 0;
  };
  const onHandleMove = (e: React.TouchEvent) => {
    if (dragStart.current === null || !panelRef.current) return;
    dragY.current = Math.max(0, e.touches[0].clientY - dragStart.current);
    panelRef.current.style.transform = `translateY(${dragY.current}px)`;
  };
  const onHandleEnd = () => {
    if (dragStart.current === null) return;
    if (panelRef.current) panelRef.current.style.transform = "";
    if (dragY.current > 80) closeAgent();
    dragStart.current = null;
  };

  const isDisabled = status === "streaming" || status === "rate_limited" || status === "resting";
  const retryMinutes = retryAfterMs ? Math.ceil(retryAfterMs / 60000) : 0;

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={toggleAgent}
        aria-label="Open YORU AI assistant"
        className={`fixed bottom-20 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-accent text-night-950 shadow-glow transition-all duration-300 hover:scale-110 active:scale-95 sm:bottom-6 ${
          open ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Sparkles strokeWidth={1.5} className="h-5 w-5" />
      </button>

      {/* Backdrop (mobile only — panel is fixed on desktop) */}
      {open && (
        <button
          type="button"
          aria-label="Close agent"
          tabIndex={-1}
          onClick={closeAgent}
          className="fixed inset-0 z-[71] bg-night-950/60 sm:hidden"
        />
      )}

      {/* Chat panel: bottom sheet on mobile, floating dock on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="YORU AI assistant"
        aria-modal="true"
        className={`fixed z-[72] flex flex-col overflow-hidden transition-all duration-300 ease-out
          bottom-0 left-0 right-0 h-[75vh] rounded-t-2xl
          sm:bottom-6 sm:right-4 sm:left-auto sm:h-[520px] sm:w-[380px] sm:rounded-2xl
          glass-panel border border-white/10
          ${open ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95 pointer-events-none"}
        `}
      >
        {/* Drag handle (mobile) */}
        <div
          onTouchStart={onHandleStart}
          onTouchMove={onHandleMove}
          onTouchEnd={onHandleEnd}
          className="flex shrink-0 cursor-grab justify-center py-2.5 sm:hidden"
        >
          <span className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-white/10 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15">
            <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-semibold text-white">YORU Assistant</p>
            <p className="text-[11px] text-zinc-500">
              {status === "streaming" ? "Thinking…" : "Ask me anything about anime"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAgent}
            aria-label="Close assistant"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <X strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 no-scrollbar">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m, i) => <AgentMessage key={i} message={m} />)
          )}

          {status === "rate_limited" && (
            <div className="flex items-center gap-2 rounded-xl bg-yellow-950/40 px-3.5 py-2.5 text-sm text-yellow-300">
              <Clock strokeWidth={1.5} className="h-4 w-4 shrink-0" />
              <span>
                Too many messages. Try again in {retryMinutes} minute{retryMinutes !== 1 ? "s" : ""}.
              </span>
            </div>
          )}

          {status === "resting" && (
            <div className="rounded-xl bg-night-800/60 px-3.5 py-2.5 text-sm text-zinc-400">
              The assistant is resting — daily limit reached. Come back tomorrow.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {status !== "resting" && (
          <AgentComposer
            onSend={(msg) => {
              resetStatus();
              sendMessage(msg);
            }}
            disabled={isDisabled}
          />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
        <Sparkles strokeWidth={1} className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">YORU Assistant</p>
        <p className="mt-1 text-xs text-zinc-500">
          Ask for recommendations, get episode info, or let me open titles for you.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((p) => (
          <span
            key={p}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-400"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

const STARTER_PROMPTS = [
  "What's good for beginners?",
  "Short series under 13 eps?",
  "Best action anime?",
  "Something like Attack on Titan?",
];
