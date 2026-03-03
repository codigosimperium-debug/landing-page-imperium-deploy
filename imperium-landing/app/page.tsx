"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppFloating from "@/components/WhatsAppFloating";

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <section className="imperium-section hero-section">
        <div className="imperium-container">
          <motion.div
            className="imperium-card premium-hero mx-auto max-w-5xl p-7 md:p-12"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-kicker text-xs uppercase tracking-[0.22em] text-muted md:text-sm">
              Imperium Academia
            </p>
            <h1 className="mt-4 text-[clamp(2rem,5vw,3.9rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
              Imperium Academia
            </h1>
            <h2 className="mt-4 text-[clamp(1.15rem,2.4vw,1.9rem)] font-semibold text-white">
              Referência em Atendimento Estruturado
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Aqui o treino é acompanhado com organização, método e presença real
              da equipe.
            </p>

            <div className="mt-8 flex flex-wrap gap-2 text-xs uppercase tracking-[0.13em] text-[var(--color-6)] md:text-sm">
              <span className="rounded-full border border-[var(--color-2)] bg-[var(--color-12)] px-3 py-1.5">Método</span>
              <span className="rounded-full border border-[var(--color-2)] bg-[var(--color-12)] px-3 py-1.5">Controle</span>
              <span className="rounded-full border border-[var(--color-2)] bg-[var(--color-12)] px-3 py-1.5">Presença da equipe</span>
            </div>

            <Link href="/#servicos" className="cta-primary mt-9">
              Conhecer Nossos Serviços
            </Link>
          </motion.div>
        </div>
      </section>

      <Section id="metodo" title="Estrutura que Gera Confiança">
        <p className="max-w-3xl text-base leading-relaxed md:text-lg">
          A Imperium foi construída com foco em organização e acompanhamento
          profissional. Com três unidades - Colina de Laranjeiras, Chácara
          Parreiral e Jacaraípe - mantemos o mesmo padrão de atendimento
          estruturado em todas elas.
        </p>
      </Section>

      <Section id="unidades" title="Unidades" alt>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="imperium-card rounded-2xl px-5 py-5 text-center text-white">Colina de Laranjeiras</div>
          <div className="imperium-card rounded-2xl px-5 py-5 text-center text-white">Chácara Parreiral</div>
          <div className="imperium-card rounded-2xl px-5 py-5 text-center text-white">Jacaraípe</div>
        </div>
      </Section>

      <Section
        title="Atendimento Setorizado Imperium"
        subtitle="Destaque principal"
      >
        <p className="max-w-3xl text-base leading-relaxed md:text-lg">
          Nossa equipe é organizada por setores e funções definidas. Isso garante
          presença ativa, correção técnica constante, acompanhamento organizado e
          direcionamento claro de evolução. O aluno não é apenas matriculado. Ele
          é acompanhado dentro de um sistema.
        </p>
      </Section>

      <Section id="servicos" title="Serviços" alt>
        <div className="grid gap-5 md:grid-cols-3">
          <ServiceCard
            href="/pilates"
            title="Pilates"
            icon="pilates"
            description="Fortalecimento, mobilidade e consciência corporal com acompanhamento técnico estruturado."
          />
          <ServiceCard
            href="/eletroestimulacao"
            title="Eletroestimulação"
            icon="ems"
            description="Tecnologia aplicada ao treino com organização, acompanhamento e controle técnico."
          />
          <ServiceCard
            href="/treinamento-funcional"
            title="Treinamento Funcional"
            icon="funcional"
            description="Condicionamento e performance acompanhados por equipe estruturada e presente."
          />
        </div>
      </Section>

      <WhatsAppFloating />
    </>
  );
}
