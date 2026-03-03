import LeadForm from "@/components/LeadForm";
import Section from "@/components/Section";

export default function TreinamentoFuncionalPage() {
  return (
    <Section
      title="Treinamento Funcional com Método"
      subtitle="Serviço Imperium"
      className="service-section"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div className="space-y-5">
          <div className="placeholder-block service-placeholder" aria-hidden="true" />
          <p className="max-w-xl text-base leading-relaxed md:text-lg">
            Condicionamento e performance acompanhados por equipe estruturada e
            presente.
          </p>
        </div>

        <LeadForm
          interesse="Treinamento Funcional"
          submitLabel="Agendar Avaliação Funcional"
        />
      </div>
    </Section>
  );
}
