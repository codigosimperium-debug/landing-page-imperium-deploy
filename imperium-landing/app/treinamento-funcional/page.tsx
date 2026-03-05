import LeadForm from "@/components/LeadForm";
import Reveal, { RevealItem } from "@/components/Reveal";

export default function TreinamentoFuncionalPage() {
  return (
    <Reveal as="section" className="imperium-section service-page">
      <div className="imperium-container">
        <RevealItem className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-6)]">Serviço Imperium</p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.8vw,3.1rem)]">Treinamento Funcional com Método</h1>
          <p className="mt-4 text-base md:text-lg">
            Condicionamento e performance acompanhados por equipe estruturada,
            com direção clara de evolução.
          </p>
        </RevealItem>

        <LeadForm
          interesse="Treinamento Funcional"
          submitLabel="Agendar Avaliação Funcional"
        />
      </div>
    </Reveal>
  );
}
