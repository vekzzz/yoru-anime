import { Instagram, Youtube, Twitch } from "lucide-react";
import { brand, footerLinks } from "../lib/site-data";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night-950">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:px-8 lg:pb-16">
        <div className="mb-12 flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Never miss a premiere
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
              New-season simulcasts and what is leaving soon, once a week. No
              spam, unsubscribe in a tap.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <span className="font-display text-2xl font-bold text-white">
              {brand.name}
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              {brand.tagline}. Simulcast anime from Japan, subbed and dubbed,
              the night it airs.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Youtube, Twitch].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  aria-label="Social link"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-accent hover:text-accent"
                >
                  <Icon strokeWidth={1.5} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#top"
                      className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name} Media. A fictional brand.</p>
          <div className="flex gap-6">
            <a href="#top" className="transition-colors hover:text-white">
              Terms
            </a>
            <a href="#top" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#top" className="transition-colors hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
