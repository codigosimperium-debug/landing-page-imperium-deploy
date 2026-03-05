"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UnitLocation } from "@/components/UnitCards";

type UnitMapPanelProps = {
  selectedUnit: UnitLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UnitMapPanel({
  selectedUnit,
  open,
  onOpenChange,
}: UnitMapPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mapFailed, setMapFailed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 20);

    return () => {
      clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (typeof document === "undefined") {
    return null;
  }

  const mapQuery = selectedUnit ? selectedUnit.enderecoCompleto : "";
  const embedSrc = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : "";

  const mapsHref = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : "https://www.google.com/maps";

  return createPortal(
    <AnimatePresence>
      {open && selectedUnit ? (
        <>
          <motion.button
            type="button"
            className="map-backdrop fixed inset-0 z-[90]"
            aria-label="Fechar mapa"
            onClick={() => onOpenChange(false)}
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Localização da unidade ${selectedUnit.nome}`}
            className="map-panel fixed inset-y-0 right-0 z-[95] w-full max-w-2xl overflow-y-auto border-l border-[var(--color-4)]/60 bg-[var(--surface)] p-4 md:p-6"
            initial={shouldReduceMotion ? undefined : { x: 42, opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { x: 42, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="imperium-card map-panel-card p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Unidade Imperium</p>
                  <h3 className="mt-1 text-2xl text-white">{selectedUnit.nome}</h3>
                  <span className="panel-header-line" aria-hidden="true" />
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Fechar painel"
                  className="map-close-btn"
                >
                  x
                </button>
              </div>

              <p className="text-sm md:text-base">{selectedUnit.enderecoCompleto}</p>
              <p className="mt-2 text-sm text-[var(--color-1)]/85">CEP {selectedUnit.cep}</p>

              <div className="map-embed mt-5 overflow-hidden rounded-xl border border-[var(--color-4)]/55">
                {embedSrc && !mapFailed ? (
                  <iframe
                    title={`Mapa ${selectedUnit.nome}`}
                    src={embedSrc}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    onError={() => setMapFailed(true)}
                  />
                ) : (
                  <div className="map-fallback">
                    <p>Não foi possível carregar o mapa neste momento.</p>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="cta-secondary mt-3"
                    >
                      Abrir no Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
