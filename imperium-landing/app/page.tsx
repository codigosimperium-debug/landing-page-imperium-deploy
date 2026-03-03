import Link from "next/link";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppFloating from "@/components/WhatsAppFloating";

export default function Home() {
  return (
    <>
      <section className="imperium-section">
        <div className="imperium-container">
          <div className="imperium-card mx-auto max-w-4xl p-8 md:p-12">
            <p className="text-sm uppercase tracking-[0.22em] text-muted">
              Imperium Academia
            </p>
            <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
              Imperium Academia
            </h1>
            <h2 className="mt-4 text-xl text-white md:text-2xl">
              Referência em Atendimento Estruturado
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg">
              Aqui o treino é acompanhado com organização, método e presença real
              da equipe.
            </p>
            <Link href="/#servicos" className="cta-primary mt-8">
              Conhecer Nossos Serviços
            </Link>
          </div>
        </div>
      </section>

      <Section id="metodo" title="Estrutura que Gera Confiança">
        <p className="max-w-3xl text-base md:text-lg">
          A Imperium foi construída com foco em organização e acompanhamento
          profissional. Com três unidades - Colina de Laranjeiras, Chácara
          Parreiral e Jacaraípe - mantemos o mesmo padrão de atendimento
          estruturado em todas elas.
        </p>
      </Section>

      <Section id="unidades" title="Unidades">
        <div className="imperium-card grid gap-4 p-6 md:grid-cols-3">
          <p className="text-center text-white">Colina de Laranjeiras</p>
          <p className="text-center text-white">Chácara Parreiral</p>
          <p className="text-center text-white">Jacaraípe</p>
        </div>
      </Section>

      <Section
        alt
        title="Atendimento Setorizado Imperium"
        subtitle="Destaque principal"
      >
        <p className="max-w-3xl text-base md:text-lg">
          Nossa equipe é organizada por setores e funções definidas. Isso garante
          presença ativa, correção técnica constante, acompanhamento organizado e
          direcionamento claro de evolução. O aluno não é apenas matriculado. Ele
          é acompanhado dentro de um sistema.
        </p>
      </Section>

      <Section id="servicos" title="Serviços">
        <div className="grid gap-5 md:grid-cols-3">
          <ServiceCard
            href="/pilates"
            title="Pilates"
            description="Fortalecimento, mobilidade e consciência corporal com acompanhamento técnico estruturado."
          />
          <ServiceCard
            href="/eletroestimulacao"
            title="Eletroestimulação"
            description="Tecnologia aplicada ao treino com organização, acompanhamento e controle técnico."
          />
          <ServiceCard
            href="/treinamento-funcional"
            title="Treinamento Funcional"
            description="Condicionamento e performance acompanhados por equipe estruturada e presente."
          />
        </div>
      </Section>

      <WhatsAppFloating />
    </>
  );
}
