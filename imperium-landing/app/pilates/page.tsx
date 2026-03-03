import LeadForm from "@/components/LeadForm";

export default function PilatesPage() {
  return (
    <section className="imperium-section">
      <div className="imperium-container">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="placeholder-block" aria-hidden="true" />

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl">
              Pilates com Acompanhamento Individualizado
            </h1>
            <p className="text-base md:text-lg">
              Fortalecimento, mobilidade e consciência corporal com acompanhamento
              técnico estruturado dentro do padrão Imperium de atendimento.
            </p>
          </div>

          <LeadForm
            interesse="Pilates"
            submitLabel="Agendar Avaliação no Pilates"
          />
        </div>
      </div>
    </section>
  );
}
