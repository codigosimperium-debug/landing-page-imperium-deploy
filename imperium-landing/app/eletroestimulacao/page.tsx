import LeadForm from "@/components/LeadForm";
import Section from "@/components/Section";

export default function EletroestimulacaoPage() {
  return (
    <Section
      title="Eletroestimulação com Supervisão Profissional"
      subtitle="Serviço Imperium"
      className="service-section"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div className="space-y-5">
          <div className="placeholder-block service-placeholder" aria-hidden="true" />
          <p className="max-w-xl text-base leading-relaxed md:text-lg">
            Tecnologia aplicada ao treino com organização, acompanhamento e
            controle técnico.
          </p>
        </div>

        <LeadForm
          interesse="Eletroestimulação"
          submitLabel="Quero Testar a Eletroestimulação"
        />
      </div>
    </Section>
  );
}
