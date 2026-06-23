import { useEffect, useRef } from "react";

// Lazy WebGL particle field for the hero. `three` is dynamically imported so it
// never lands in the SSR or above-the-fold bundle — it loads only on the client
// after mount. Fully skipped under reduced motion or if WebGL is unavailable;
// the CSS gradient underneath is the fallback.
export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
      } catch {
        return; // No WebGL — gradient fallback stays.
      }

      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 22;

      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 700 : 1600;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      const material = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: isMobile ? 0.05 : 0.045,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        points.rotation.y = t * 0.04;
        points.rotation.x = Math.sin(t * 0.12) * 0.05;
        // Subtle parallax toward the cursor (no React state, no re-render).
        camera.position.x += (pointer.x * 2.5 - camera.position.x) * 0.03;
        camera.position.y += (-pointer.y * 1.6 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(render);
      };
      render();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointer);
        ro.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
