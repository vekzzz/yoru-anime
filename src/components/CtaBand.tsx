import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function CtaBand() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id="start" className="relative scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28">
      <Reveal
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-night-900 px-6 py-16 text-center sm:px-12 lg:py-24"
        y={40}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 120% at 50% 0%, rgba(34,211,238,0.22), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            The next episode won&apos;t
            <br className="hidden sm:block" /> watch itself.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-zinc-400">
            Make a free account and start your first simulcast tonight.
          </p>

          {done ? (
            <div className="mx-auto mt-9 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-accent">
              <Check strokeWidth={2} className="h-5 w-5" />
              You&apos;re in. Check {email} to set a password.
            </div>
          ) : (
            <form
              className="mx-auto mt-9 flex max-w-md flex-col gap-3 text-left sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setDone(true);
              }}
            >
              <div className="flex-1">
                <label
                  htmlFor="cta-email"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Email
                </label>
                <input
                  id="cta-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-white/15 bg-night-950 px-5 py-3.5 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 self-end rounded-full bg-accent px-7 py-3.5 font-semibold text-night-950 transition-transform duration-200 hover:bg-accent-bright active:scale-[0.97]"
              >
                Start watching
                <ArrowRight strokeWidth={2} className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="mt-5 text-sm text-zinc-500">
            14 days of premium free. Cancel whenever.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
