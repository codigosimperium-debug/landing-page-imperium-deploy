import LeadForm from "@/components/LeadForm";

export default function EletroestimulacaoPage() {
  return (
    <section className="imperium-section">
      <div className="imperium-container">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="placeholder-block" aria-hidden="true" />

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl">
              Eletroestimulação com Supervisão Profissional
            </h1>
            <p className="text-base md:text-lg">
              Tecnologia aplicada ao treino com organização, acompanhamento e
              controle técnico.
            </p>
          </div>

          <LeadForm
            interesse="Eletroestimulação"
            submitLabel="Quero Testar a Eletroestimulação"
          />
        </div>
      </div>
    </section>
  );
}
