import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { agentStore } from "#/lib/agent/store";

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
};

export function AgentComposer({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pick up seed message injected from command palette.
  useEffect(() => {
    const seed = agentStore.takeSeed();
    if (seed) {
      setValue(seed);
      inputRef.current?.focus();
    }
  }, []);

  // Auto-focus when not disabled.
  useEffect(() => {
    if (!disabled) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  // Auto-resize textarea.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    const msg = value.trim();
    if (!msg || disabled) return;
    setValue("");
    onSend(msg);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-white/10 px-3 py-3">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Ask about anime…"
        aria-label="Message YORU agent"
        className="no-scrollbar min-h-[36px] flex-1 resize-none rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent/50 disabled:opacity-40"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-night-950 transition hover:bg-accent-bright active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send strokeWidth={2} className="h-4 w-4" />
      </button>
    </div>
  );
}
