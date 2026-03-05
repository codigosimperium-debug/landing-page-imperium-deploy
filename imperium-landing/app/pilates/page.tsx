import LeadForm from "@/components/LeadForm";
import Reveal, { RevealItem } from "@/components/Reveal";

export default function PilatesPage() {
  return (
    <Reveal as="section" className="imperium-section service-page">
      <div className="imperium-container">
        <RevealItem className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-6)]">Serviço Imperium</p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.8vw,3.1rem)]">Pilates com Acompanhamento Individualizado</h1>
          <p className="mt-4 text-base md:text-lg">
            Fortalecimento, mobilidade e consciência corporal com acompanhamento
            técnico estruturado dentro do padrão Imperium de atendimento.
          </p>
        </RevealItem>

        <LeadForm interesse="Pilates" submitLabel="Agendar Avaliação no Pilates" />
      </div>
    </Reveal>
  );
}
