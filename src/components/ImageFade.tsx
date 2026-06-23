import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: "lazy" | "eager";
  ariaHidden?: boolean;
};

export function ImageFade({
  src,
  alt,
  className = "",
  fallback,
  loading = "lazy",
  ariaHidden,
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (ref.current?.complete && !ref.current.naturalWidth) {
      setErrored(true);
      setLoaded(true);
    } else if (ref.current?.complete) {
      setLoaded(true);
    }
  }, []);

  const visible = !mounted || loaded;

  if (errored) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-night-850 text-zinc-700`}
        aria-hidden={ariaHidden}
      >
        <ImageOff strokeWidth={1.5} className="h-6 w-6" />
      </div>
    );
  }

  return (
    <>
      {mounted && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-night-850" aria-hidden />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        aria-hidden={ariaHidden}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const t = e.currentTarget;
          if (fallback && t.dataset.fb !== "1") {
            t.dataset.fb = "1";
            t.src = fallback;
          } else {
            setErrored(true);
            setLoaded(true);
          }
        }}
        className={`${className} transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
