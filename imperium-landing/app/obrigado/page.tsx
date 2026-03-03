import ThankYouView from "@/components/ThankYouView";

export default function ObrigadoFallbackPage() {
  return (
    <ThankYouView
      title="Cadastro confirmado."
      description="Recebemos seus dados e nosso time vai confirmar sua avaliação em breve."
      bullets={[
        "Nossa equipe valida unidade e disponibilidade.",
        "Você recebe contato para confirmar horário e início.",
      ]}
    />
  );
}
