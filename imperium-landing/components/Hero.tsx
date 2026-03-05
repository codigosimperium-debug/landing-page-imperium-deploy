"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-band">
      <Image
        src="/assets/hero-team.avif"
        alt="Equipe Imperium Academia"
        fill
        priority
        quality={62}
        className="hero-band-image"
        sizes="100vw"
      />

      <div className="hero-band-overlay" aria-hidden="true" />
      <div className="hero-band-glow" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="hero-band-content max-w-2xl">
          <p className="hero-label">ATENDIMENTO ESTRUTURADO</p>
          <span className="hero-detail-line" aria-hidden="true" />

          <h1 className="mt-5 text-[clamp(2rem,5.2vw,4.3rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
            Imperium Academia
          </h1>

          <h2 className="mt-4 text-[clamp(1.1rem,2.1vw,1.85rem)] font-semibold text-white">
            Referência em Atendimento Estruturado
          </h2>

          <p className="mt-5 max-w-2xl text-base md:text-lg">
            Aqui o treino é acompanhado com organização, método e presença real da equipe.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 hero-cta-group">
            <Link
              href="/#servicos"
              className="cta-primary"
              data-track-click="home_cta_servicos"
            >
              Escolher um serviço
            </Link>
            <Link
              href="/#unidades"
              className="cta-secondary"
              data-track-click="home_cta_unidades"
            >
              Ver unidades
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
