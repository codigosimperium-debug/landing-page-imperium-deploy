import ThankYouView from "@/components/ThankYouView";

export default function ObrigadoPilatesPage() {
  return (
    <ThankYouView
      title="Pilates confirmado."
      description="Seu cadastro para Pilates foi recebido com sucesso."
      bullets={[
        "Vamos confirmar sua unidade e horário de avaliação.",
        "Você recebe orientação inicial pelo WhatsApp.",
      ]}
    />
  );
}
