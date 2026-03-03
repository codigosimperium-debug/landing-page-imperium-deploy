import LeadForm from "@/components/LeadForm";
import Section from "@/components/Section";

export default function PilatesPage() {
  return (
    <Section
      title="Pilates com Acompanhamento Individualizado"
      subtitle="Serviço Imperium"
      className="service-section"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div className="space-y-5">
          <div className="placeholder-block service-placeholder" aria-hidden="true" />
          <p className="max-w-xl text-base leading-relaxed md:text-lg">
            Fortalecimento, mobilidade e consciência corporal com acompanhamento
            técnico estruturado dentro do padrão Imperium de atendimento.
          </p>
        </div>

        <LeadForm interesse="Pilates" submitLabel="Agendar Avaliação no Pilates" />
      </div>
    </Section>
  );
}
