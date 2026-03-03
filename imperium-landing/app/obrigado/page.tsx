"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackLead, trackPageView } from "@/lib/metaPixel";

export default function ObrigadoPage() {
  useEffect(() => {
    trackPageView();
    trackLead();
  }, []);

  return (
    <section className="imperium-section">
      <div className="imperium-container">
        <div className="imperium-card mx-auto max-w-2xl p-8 text-center md:p-10">
          <h1 className="text-3xl md:text-4xl">Recebemos seu cadastro.</h1>
          <p className="mt-4 text-base md:text-lg">
            Nossa equipe vai entrar em contato para confirmar sua avaliação e
            unidade de interesse.
          </p>
          <Link href="/" className="cta-primary mt-8">
            Voltar para a Home
          </Link>
        </div>
      </div>
    </section>
  );
}
