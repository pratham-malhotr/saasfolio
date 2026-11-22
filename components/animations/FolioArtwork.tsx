"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Rotate3D, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { folioContent, type FolioVariant } from "./folio-content";
import type { createFolioScene } from "./folio-scene";
import "./folio-artwork.css";

type Drag = { id: number; x: number; y: number; active: boolean };

export function FolioArtwork({ variant }: { variant: FolioVariant }) {
  const artworkRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof createFolioScene>>(undefined);
  const currentView = useRef(0);
  const drag = useRef<Drag | undefined>(undefined);
  const [view, setView] = useState(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { label, views } = folioContent[variant];
  const selected = views[view];

  useEffect(() => {
    const artwork = artworkRef.current;
    if (!artwork || !("IntersectionObserver" in window) || !("ResizeObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let inView = false;
    let loading = false;
    let attempted = false;
    let disposed = false;
    let idleTask: number | undefined;
    let timeout: number | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let resizeObserver: ResizeObserver | undefined;

    function cancelLoad() {
      if (idleTask !== undefined) window.cancelIdleCallback(idleTask);
      window.clearTimeout(timeout);
      idleTask = undefined;
      timeout = undefined;
    }

    function stopScene() {
      cancelLoad();
      resizeObserver?.disconnect();
      canvas?.removeEventListener("webglcontextlost", showPoster);
      sceneRef.current?.dispose();
      sceneRef.current = undefined;
      canvas?.remove();
      canvas = undefined;
      drag.current = undefined;
    }

    function showPoster() {
      stopScene();
      setReady(false);
      setDragging(false);
    }

    function canDraw() {
      return inView && !document.hidden && motion.matches && !connection?.saveData;
    }

    async function loadScene() {
      idleTask = undefined;
      timeout = undefined;
      if (!artwork || disposed || !canDraw()) return;
      loading = true;
      try {
        const { createFolioScene } = await import("./folio-scene");
        if (disposed || !canDraw()) return;
        attempted = true;
        const compact = window.matchMedia("(width < 768px), (pointer: coarse)").matches;
        const layer = document.createElement("canvas");
        layer.className = "folio-canvas";
        const scene = createFolioScene(layer, variant, compact, currentView.current, views.map(item => item.accent), {
          onPaint: () => setReady(true),
          onFailure: showPoster,
        });
        if (!scene) return;
        canvas = layer;
        sceneRef.current = scene;
        layer.addEventListener("webglcontextlost", showPoster);
        artwork.append(layer);
        scene.resize(artwork.clientWidth, artwork.clientHeight);
        resizeObserver = new ResizeObserver(([entry]) => scene.resize(entry.contentRect.width, entry.contentRect.height));
        resizeObserver.observe(artwork);
      } catch {
        attempted = true;
        showPoster();
      } finally {
        loading = false;
        if (!disposed) syncVisibility();
      }
    }

    function syncVisibility() {
      const active = canDraw();
      sceneRef.current?.setVisible(active);
      if (!active) cancelLoad();
      else if (!loading && !attempted && idleTask === undefined && timeout === undefined) {
        if (typeof window.requestIdleCallback === "function") {
          idleTask = window.requestIdleCallback(() => void loadScene(), { timeout: 1100 });
        } else timeout = window.setTimeout(() => void loadScene(), 160);
      }
    }

    function preferencesChanged() {
      if (!motion.matches || connection?.saveData) {
        showPoster();
        attempted = false;
      }
      syncVisibility();
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVisibility();
    }, { threshold: 0.08 });
    observer.observe(artwork);
    motion.addEventListener("change", preferencesChanged);
    connection?.addEventListener("change", preferencesChanged);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      disposed = true;
      stopScene();
      observer.disconnect();
      motion.removeEventListener("change", preferencesChanged);
      connection?.removeEventListener("change", preferencesChanged);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [variant, views]);

  function selectView(index: number) {
    if (index === currentView.current) return;
    currentView.current = index;
    setView(index);
    sceneRef.current?.select(index);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene) return;
    const tracked = drag.current;
    if (tracked?.id === event.pointerId) {
      const dx = event.clientX - tracked.x;
      const dy = event.clientY - tracked.y;
      if (!tracked.active) {
        if (event.pointerType === "touch" && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
          drag.current = undefined;
          return;
        }
        if (Math.abs(dx) + Math.abs(event.pointerType === "touch" ? 0 : dy) < 6) return;
        tracked.active = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      tracked.x = event.clientX;
      tracked.y = event.clientY;
      scene.orbit(dx, event.pointerType === "touch" ? 0 : dy);
    } else if (event.pointerType === "mouse" && !tracked) {
      const bounds = event.currentTarget.getBoundingClientRect();
      scene.point((event.clientX - bounds.left) / bounds.width - .5, (event.clientY - bounds.top) / bounds.height - .5);
    }
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = undefined;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <section className="folio-frame" aria-label={label} data-variant={variant} data-active={ready || undefined} data-dragging={dragging || undefined} style={{ "--folio-accent": selected.accent } as CSSProperties}>
      <div className="folio-toolbar">
        <p>{label}</p>
        <div className="folio-actions" hidden={!ready}>
          <button type="button" onClick={() => sceneRef.current?.rotate()} aria-label="Rotate 3D illustration" title="Rotate 3D illustration"><Rotate3D size={17} aria-hidden="true" /></button>
          <button type="button" onClick={() => sceneRef.current?.reset()} aria-label="Reset 3D view" title="Reset 3D view"><RotateCcw size={15} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="folio-stage">
        <div
          ref={artworkRef}
          className="folio-artwork"
          aria-hidden="true"
          onPointerDown={event => {
            if (!sceneRef.current || !event.isPrimary || event.button !== 0) return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false };
          }}
          onPointerMove={move}
          onPointerUp={release}
          onLostPointerCapture={release}
          onPointerCancel={release}
          onPointerLeave={event => {
            if (!drag.current?.active) release(event);
            sceneRef.current?.point(0, 0);
          }}
        >
          <Image src={`/images/scenes/${variant}.webp`} alt="" fill unoptimized loading="eager" fetchPriority="low" className="folio-poster" />
        </div>
        {ready && <span className="folio-gesture" aria-hidden="true">Drag to orbit</span>}
      </div>
      <div className="folio-views" role="group" aria-label="Choose a view">
        {views.map((item, index) => <button key={item.name} type="button" aria-pressed={view === index} onClick={() => selectView(index)}>{item.name}</button>)}
      </div>
      <div className="folio-detail" aria-live="polite" aria-atomic="true">
        <p>{selected.detail}</p>
        <Link href={selected.href} prefetch={false}>{selected.link}</Link>
      </div>
    </section>
  );
}
