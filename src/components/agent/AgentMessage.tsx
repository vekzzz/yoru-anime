import type { ChatMessage } from "#/lib/agent/store";
import { CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export function AgentMessage({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent/20 px-3.5 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "action") {
    return (
      <div className="flex items-center gap-2 text-xs text-accent">
        <CheckCircle strokeWidth={1.5} className="h-3.5 w-3.5 shrink-0" />
        <span>{message.label}</span>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
        <Sparkles strokeWidth={1.5} className="h-3 w-3 text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        {message.content ? (
          <FormattedContent content={message.content} done={message.done} />
        ) : (
          !message.done && <TypingDots />
        )}
      </div>
    </div>
  );
}

function FormattedContent({ content, done }: { content: string; done: boolean }) {
  // Split on double newlines to handle paragraphs and bullet lists.
  const blocks = content.split(/\n\n+/);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-200">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^[-*•]\s/.test(l.trim()) || l.trim() === "");
        if (isList) {
          return (
            <ul key={i} className="space-y-1 pl-1">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{l.replace(/^[-*•]\s*/, "")}</span>
                  </li>
                ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
      {!done && <span className="inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-950/40 px-3.5 py-2.5 text-sm text-red-300">
      <AlertCircle strokeWidth={1.5} className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
