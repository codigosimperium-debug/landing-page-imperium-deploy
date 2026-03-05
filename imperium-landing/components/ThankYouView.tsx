"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { trackLead, trackPageView } from "@/lib/metaPixel";
import { track } from "@/lib/trackingClient";

type ThankYouViewProps = {
  title: string;
  description: string;
  bullets: [string, string];
};

function ConfirmationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8 12.3 2.6 2.6L16.3 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThankYouView({ title, description, bullets }: ThankYouViewProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    trackPageView();
    trackLead();
    void track("thank_you_view");
  }, []);

  return (
    <section className="imperium-section service-page">
      <div className="imperium-container">
        <motion.div
          className="imperium-card mx-auto max-w-2xl p-8 md:p-10"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.52 }}
        >
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-2)] bg-[var(--color-12)] text-[var(--color-1)]">
            <ConfirmationIcon />
          </div>

          <h1 className="mt-5 text-center text-3xl md:text-4xl">{title}</h1>
          <p className="mt-4 text-center text-base md:text-lg">{description}</p>

          <div className="mt-6 rounded-2xl border border-[var(--color-2)] bg-[var(--color-12)] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-6)]">Próximo passo</p>
            <ul className="mt-3 space-y-2 text-sm md:text-base">
              <li className="text-[var(--color-1)]">1. {bullets[0]}</li>
              <li className="text-[var(--color-1)]">2. {bullets[1]}</li>
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="cta-primary" data-track-click="thankyou_back_home">
              Voltar para a Home
            </Link>
            <Link href="/#unidades" className="cta-secondary" data-track-click="thankyou_view_units">
              Ver Unidades
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
