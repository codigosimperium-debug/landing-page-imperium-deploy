"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Hero from "@/components/Hero";
import Reveal, { RevealItem } from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import UnitCards, { type UnitLocation } from "@/components/UnitCards";
import WhatsAppFloating from "@/components/WhatsAppFloating";

const UnitMapPanel = dynamic(() => import("@/components/UnitMapPanel"), {
  ssr: false,
  loading: () => null,
});

const setorizadoCards = [
  {
    title: "Presença ativa",
    text: "Equipe presente durante todo o treino, com atenção prática e contínua.",
  },
  {
    title: "Correção técnica",
    text: "Ajustes objetivos para manter execução precisa, segura e eficiente.",
  },
  {
    title: "Direcionamento",
    text: "Evolução com critério claro, sem improviso e com método.",
  },
  {
    title: "Organização",
    text: "Fluxo setorizado que sustenta consistência no atendimento diário.",
  },
];

const estruturaCards = [
  {
    title: "Padrão nas unidades",
    text: "Jacaraípe, Chácara Parreiral e Colina de Laranjeiras seguem o mesmo padrão de método.",
  },
  {
    title: "Ambiente premium",
    text: "Estrutura funcional, visual limpo e foco total na execução do atendimento.",
  },
  {
    title: "Rotina organizada",
    text: "Processo de avaliação, acompanhamento e direção de evolução com controle real.",
  },
];

const avaliacaoSteps = [
  {
    title: "Escolha o serviço",
    text: "Pilates, Eletroestimulação ou Treinamento Funcional.",
  },
  {
    title: "Envie seu cadastro",
    text: "Dados objetivos para a equipe organizar seu primeiro atendimento.",
  },
  {
    title: "Equipe confirma pelo WhatsApp",
    text: "Você recebe confirmação da unidade e disponibilidade de avaliação.",
  },
];

const units: UnitLocation[] = [
  {
    id: "jacaraipe",
    nome: "Jacaraípe",
    bairro: "Jacaraípe",
    enderecoResumo: "Avenida Abido Saad, 2298, Jacaraipe, Serra - ES",
    cep: "29175-585",
    enderecoCompleto: "Avenida Abido Saad, 2298, Jacaraipe, Serra - ES, CEP 29175-585",
  },
  {
    id: "parreiral",
    nome: "Chácara Parreiral",
    bairro: "Chácara Parreiral",
    enderecoResumo: "Rua Gustavo Barroso, 570, Chácara Parreiral, Serra - ES",
    cep: "29065-540",
    enderecoCompleto: "Rua Gustavo Barroso, 570, Chácara Parreiral, Serra - ES, CEP 29065-540",
  },
  {
    id: "colina",
    nome: "Colina de Laranjeiras",
    bairro: "Colina de Laranjeiras",
    enderecoResumo: "Avenida Brauna, 1000, Colina de Laranjeiras, Serra - ES",
    cep: "29167-124",
    enderecoCompleto:
      "Avenida Brauna, 1000, Colina de Laranjeiras, Serra - ES, CEP 29167-124",
  },
];

const faqItems = [
  {
    q: "O professor dá atenção mesmo ou é só no início?",
    a: "A atenção é contínua. O atendimento setorizado mantém presença ativa e correção técnica durante o treino.",
  },
  {
    q: "Eletroestimulação dói?",
    a: "A intensidade é ajustada por profissional. O processo é controlado e respeita seu nível atual.",
  },
  {
    q: "Pilates é só alongamento?",
    a: "Não. O método trabalha força, mobilidade, estabilidade e consciência corporal com foco técnico.",
  },
  {
    q: "Como escolher a unidade?",
    a: "Após seu cadastro, a equipe direciona a melhor unidade conforme sua rotina e localização.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedUnit, setSelectedUnit] = useState<UnitLocation | null>(null);
  const [isUnitDrawerOpen, setIsUnitDrawerOpen] = useState(false);
  const [unitDrawerNonce, setUnitDrawerNonce] = useState(0);

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const directWhatsAppHref = number
    ? `https://wa.me/55${number}?text=${encodeURIComponent(
        "Quero tirar dúvidas individuais antes da avaliação.",
      )}`
    : "/#servicos";

  function openUnitDrawer(unit: UnitLocation) {
    setSelectedUnit(unit);
    setUnitDrawerNonce((prev) => prev + 1);
    setIsUnitDrawerOpen(true);
  }

  function onUnitDrawerChange(open: boolean) {
    setIsUnitDrawerOpen(open);
    if (!open) {
      setSelectedUnit(null);
    }
  }

  return (
    <>
      <Hero />

      <Reveal as="section" id="metodo" className="imperium-section" stagger={0.08}>
        <div className="imperium-container">
          <RevealItem>
            <p className="section-kicker">Núcleo Imperium</p>
            <h2 className="section-title">Atendimento Setorizado</h2>
            <p className="section-copy max-w-3xl">
              Excelência no atendimento começa com estrutura clara de função, presença
              real e método aplicado em cada sessão.
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
            <p className="section-kicker">Estrutura premium</p>
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

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {avaliacaoSteps.map((step, index) => (
              <RevealItem key={step.title}>
                <div className="imperium-card step-card p-5">
                  <p className="step-index">0{index + 1}</p>
                  <p className="mt-2 text-base text-white">{step.title}</p>
                  <p className="mt-2 text-sm">{step.text}</p>
                </div>
              </RevealItem>
            ))}

            <RevealItem>
              <div className="imperium-card step-card step-contact-card p-5">
                <p className="step-index">04</p>
                <p className="mt-2 text-base text-white">
                  Prefere tirar dúvidas individuais antes?
                </p>
                <p className="mt-2 text-sm">
                  Nossa equipe pode orientar você antes da avaliação.
                </p>
                <a
                  href={directWhatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="cta-secondary mt-4 w-full"
                  data-track-click="home_direct_whatsapp"
                >
                  Falar com a Imperium
                </a>
              </div>
            </RevealItem>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        id="servicos"
        className="imperium-section imperium-section-alt"
        stagger={0.08}
      >
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

          <UnitCards units={units} onSelect={openUnitDrawer} />
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
                      <span className="faq-indicator">{open ? "-" : "+"}</span>
                    </button>
                    {open ? <p className="faq-answer">{item.a}</p> : null}
                  </article>
                </RevealItem>
              );
            })}
          </div>
        </div>
      </Reveal>

      <UnitMapPanel
        key={`unit-drawer-${unitDrawerNonce}`}
        selectedUnit={selectedUnit}
        open={isUnitDrawerOpen}
        onOpenChange={onUnitDrawerChange}
      />
      <WhatsAppFloating />
    </>
  );
}
