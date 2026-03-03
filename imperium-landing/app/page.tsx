"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal, { RevealItem } from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppFloating from "@/components/WhatsAppFloating";

const setorizadoCards = [
  { title: "Presença ativa", text: "Equipe presente durante o treino, não apenas na matrícula." },
  { title: "Correção técnica", text: "Ajustes contínuos para manter execução precisa e segura." },
  { title: "Direcionamento", text: "Evolução guiada com critério, sem improviso." },
  { title: "Organização", text: "Rotina de atendimento setorizada e consistente." },
];

const estruturaCards = [
  {
    title: "Padrão nas unidades",
    text: "Colina de Laranjeiras, Chácara Parreiral e Jacaraípe seguem a mesma lógica de atendimento.",
  },
  {
    title: "Rotina organizada",
    text: "Planejamento técnico, acompanhamento e registro de progresso de forma estruturada.",
  },
  {
    title: "Ambiente premium e funcional",
    text: "Estrutura pensada para fluidez operacional, foco e qualidade de execução.",
  },
];

const avaliacaoSteps = [
  "Escolha o serviço",
  "Envie seus dados",
  "Equipe confirma pelo WhatsApp",
];

const unidades = [
  {
    nome: "Colina de Laranjeiras",
    endereco: "Av. Guarapari, 12 - Serra, ES",
    horario: "Segunda a sexta, 06h às 22h",
    maps: "https://www.google.com/maps/search/?api=1&query=Colina+de+Laranjeiras+Serra+ES",
  },
  {
    nome: "Chácara Parreiral",
    endereco: "Av. Central, 245 - Serra, ES",
    horario: "Segunda a sexta, 06h às 21h",
    maps: "https://www.google.com/maps/search/?api=1&query=Ch%C3%A1cara+Parreiral+Serra+ES",
  },
  {
    nome: "Jacaraípe",
    endereco: "Av. Minas Gerais, 88 - Serra, ES",
    horario: "Segunda a sábado, 06h às 20h",
    maps: "https://www.google.com/maps/search/?api=1&query=Jacara%C3%ADpe+Serra+ES",
  },
];

const faqItems = [
  {
    q: "O professor dá atenção mesmo ou é só no início?",
    a: "O acompanhamento é contínuo. A equipe atua por setores, com presença ativa e correção técnica durante o treino.",
  },
  {
    q: "Eletroestimulação dói?",
    a: "A sensação é controlada e ajustada por profissional. O protocolo é progressivo, respeitando seu nível atual.",
  },
  {
    q: "Pilates é só alongamento?",
    a: "Não. O método trabalha força, mobilidade, estabilidade e consciência corporal com objetivo técnico definido.",
  },
  {
    q: "Como escolher a unidade?",
    a: "Após o cadastro, a equipe confirma sua avaliação considerando localização, rotina e disponibilidade de horários.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Reveal as="section" className="imperium-section hero-section home-grid" stagger={0.08}>
        <div className="imperium-container">
          <div className="imperium-card hero-shell p-7 md:p-12">
            <RevealItem>
              <p className="hero-kicker text-xs uppercase tracking-[0.2em] text-[var(--color-6)] md:text-sm">
                Imperium Academia
              </p>
            </RevealItem>

            <RevealItem>
              <h1 className="mt-4 text-[clamp(2rem,5.2vw,4.3rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
                Imperium Academia
              </h1>
            </RevealItem>

            <RevealItem>
              <h2 className="mt-4 text-[clamp(1.1rem,2.1vw,1.85rem)] font-semibold text-white">
                Referência em Atendimento Estruturado
              </h2>
            </RevealItem>

            <RevealItem>
              <p className="mt-5 max-w-2xl text-base md:text-lg">
                Aqui o treino é acompanhado com organização, método e presença real
                da equipe.
              </p>
            </RevealItem>

            <RevealItem>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#servicos" className="cta-primary">
                  Escolher um serviço
                </Link>
                <Link href="/#unidades" className="cta-secondary">
                  Ver unidades
                </Link>
              </div>
            </RevealItem>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" id="metodo" className="imperium-section" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Núcleo Imperium</p>
            <h2 className="section-title">Atendimento Setorizado</h2>
            <p className="section-copy max-w-3xl">
              Atenção é protocolo: setores, função definida e presença real durante
              o treino.
            </p>
          </RevealItem>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {setorizadoCards.map((item) => (
              <RevealItem key={item.title}>
                <article className="imperium-card feature-card p-5">
                  <h3 className="text-xl text-white">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base">{item.text}</p>
                </article>
              </RevealItem>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="imperium-section imperium-section-alt" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Estrutura</p>
            <h2 className="section-title">Estrutura que sustenta o método</h2>
          </RevealItem>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {estruturaCards.map((item) => (
              <RevealItem key={item.title}>
                <article className="imperium-card feature-card p-6">
                  <h3 className="text-xl text-white">{item.title}</h3>
                  <p className="mt-3 text-sm md:text-base">{item.text}</p>
                </article>
              </RevealItem>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="imperium-section" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Fluxo de entrada</p>
            <h2 className="section-title">Como funciona a avaliação</h2>
          </RevealItem>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {avaliacaoSteps.map((step, index) => (
              <RevealItem key={step}>
                <div className="imperium-card step-card p-5">
                  <p className="step-index">0{index + 1}</p>
                  <p className="mt-2 text-base text-white">{step}</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" id="servicos" className="imperium-section imperium-section-alt" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Serviços</p>
            <h2 className="section-title">Escolha o foco do seu atendimento</h2>
          </RevealItem>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <RevealItem>
              <ServiceCard
                href="/pilates"
                title="Pilates"
                icon="pilates"
                description="Mobilidade, força e consciência corporal com acompanhamento individualizado."
                buttonLabel="Saiba Mais"
              />
            </RevealItem>
            <RevealItem>
              <ServiceCard
                href="/eletroestimulacao"
                title="Eletroestimulação"
                icon="ems"
                description="Tecnologia aplicada ao treino com supervisão e controle técnico constante."
                buttonLabel="Saiba Mais"
              />
            </RevealItem>
            <RevealItem>
              <ServiceCard
                href="/treinamento-funcional"
                title="Treinamento Funcional"
                icon="funcional"
                description="Treino orientado para condicionamento e performance com método."
                buttonLabel="Saiba Mais"
              />
            </RevealItem>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" id="unidades" className="imperium-section" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Unidades</p>
            <h2 className="section-title">Atendimento estruturado nas três unidades</h2>
          </RevealItem>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {unidades.map((u) => (
              <RevealItem key={u.nome}>
                <article className="imperium-card unidade-card p-5">
                  <h3 className="text-xl text-white">{u.nome}</h3>
                  <p className="mt-2 text-sm">{u.endereco}</p>
                  <p className="mt-1 text-sm text-[var(--color-6)]">{u.horario}</p>
                  <a href={u.maps} target="_blank" rel="noreferrer" className="cta-secondary mt-5">
                    Abrir no Maps
                  </a>
                </article>
              </RevealItem>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="imperium-section imperium-section-alt" stagger={0.06}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">FAQ</p>
            <h2 className="section-title">Perguntas frequentes</h2>
          </RevealItem>

          <div className="mt-7 space-y-3">
            {faqItems.map((item, index) => {
              const open = openFaq === index;
              return (
                <RevealItem key={item.q}>
                  <article className="imperium-card faq-item">
                    <button
                      type="button"
                      className="faq-trigger"
                      aria-expanded={open}
                      onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
                    >
                      <span>{item.q}</span>
                      <span className="faq-indicator">{open ? "−" : "+"}</span>
                    </button>
                    {open ? <p className="faq-answer">{item.a}</p> : null}
                  </article>
                </RevealItem>
              );
            })}
          </div>
        </div>
      </Reveal>

      <WhatsAppFloating />
    </>
  );
}
