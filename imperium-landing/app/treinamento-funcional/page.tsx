import LeadForm from "@/components/LeadForm";

export default function TreinamentoFuncionalPage() {
  return (
    <section className="imperium-section">
      <div className="imperium-container">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="placeholder-block" aria-hidden="true" />

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl">
              Treinamento Funcional com Método
            </h1>
            <p className="text-base md:text-lg">
              Condicionamento e performance acompanhados por equipe estruturada e
              presente.
            </p>
          </div>

          <LeadForm
            interesse="Treinamento Funcional"
            submitLabel="Agendar Avaliação Funcional"
          />
        </div>
      </div>
    </section>
  );
}
