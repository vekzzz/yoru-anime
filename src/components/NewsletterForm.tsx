import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "done" | "error";

const isValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Newsletter signup with the full state cycle: idle, inline validation error,
// loading, and a composed success state. (Submit is simulated client-side.)
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) {
      setError("Enter your email to subscribe.");
      setStatus("error");
      return;
    }
    if (!isValid(v)) {
      setError("That email doesn't look right.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  };

  if (status === "done") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm text-accent">
        <Check strokeWidth={2} className="h-4 w-4" />
        You&apos;re on the list. First drop lands next season.
      </div>
    );
  }

  const errored = status === "error";

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-md">
      <label
        htmlFor="nl-email"
        className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400"
      >
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="nl-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errored) setStatus("idle");
          }}
          aria-invalid={errored}
          aria-describedby={errored ? "nl-error" : undefined}
          placeholder="you@example.com"
          className={`flex-1 rounded-full border bg-night-950 px-5 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
            errored
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-white/15 focus:border-accent focus:ring-accent/40"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-night-950 transition-transform duration-200 hover:bg-accent-bright active:scale-[0.97] disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <Loader2 strokeWidth={2} className="h-4 w-4 animate-spin" />
              Joining
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight strokeWidth={2} className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {errored && (
        <p id="nl-error" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
