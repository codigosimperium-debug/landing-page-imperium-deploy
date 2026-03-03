"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { trackLead, trackPageView } from "@/lib/metaPixel";

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

export default function ObrigadoPage() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    trackPageView();
    trackLead();
  }, []);

  return (
    <section className="imperium-section">
      <div className="imperium-container">
        <motion.div
          className="imperium-card mx-auto max-w-2xl p-8 text-center md:p-10"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-2)] bg-[var(--color-12)] text-[var(--color-1)]">
            <ConfirmationIcon />
          </div>

          <h1 className="mt-5 text-3xl md:text-4xl">Recebemos seu cadastro.</h1>
          <p className="mt-4 text-base md:text-lg">
            Nossa equipe vai entrar em contato para confirmar sua avaliação e
            unidade de interesse.
          </p>
          <Link href="/" className="cta-primary mt-8">
            Voltar para a Home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
