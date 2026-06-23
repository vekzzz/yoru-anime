import { features } from "../lib/site-data";
import { Reveal } from "./Reveal";

// Asymmetric feature layout (no three-equal-cards). A sticky heading column on
// the left, a 6-col feature grid on the right with two wide rows and one split
// row, separated by hairlines rather than boxed cards.
export function WhyYoru() {
  const [wideTop, midA, midB, wideBottom] = features;

  return (
    <section id="why" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built for people who actually watch
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-zinc-400">
                No autoplay traps, no buried player settings. Just the fastest,
                cleanest way to keep up with the shows you love.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-6">
            <FeatureWide feature={wideTop} />
            <FeatureCell feature={midA} className="sm:col-span-3" />
            <FeatureCell feature={midB} className="sm:col-span-3" />
            <FeatureWide feature={wideBottom} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeatureWide({ feature }: { feature: (typeof features)[number] }) {
  return (
    <div className="flex flex-col gap-4 bg-night-950 p-8 sm:col-span-6 sm:flex-row sm:items-center sm:gap-10">
      {feature.stat && (
        <span className="font-display text-5xl font-bold tracking-tight text-accent lg:text-6xl">
          {feature.stat}
        </span>
      )}
      <div className="max-w-md">
        <h3 className="font-display text-xl font-semibold text-white">
          {feature.title}
        </h3>
        <p className="mt-2 leading-relaxed text-zinc-400">{feature.body}</p>
      </div>
    </div>
  );
}

function FeatureCell({
  feature,
  className = "",
}: {
  feature: (typeof features)[number];
  className?: string;
}) {
  return (
    <div className={`bg-night-950 p-8 ${className}`}>
      <h3 className="font-display text-xl font-semibold text-white">
        {feature.title}
      </h3>
      <p className="mt-2 leading-relaxed text-zinc-400">{feature.body}</p>
    </div>
  );
}
