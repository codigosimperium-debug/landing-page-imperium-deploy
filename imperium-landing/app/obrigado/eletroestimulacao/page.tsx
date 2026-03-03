import ThankYouView from "@/components/ThankYouView";

export default function ObrigadoEletroPage() {
  return (
    <ThankYouView
      title="Eletroestimulação confirmada."
      description="Seu interesse em Eletroestimulação já foi encaminhado ao time técnico."
      bullets={[
        "Vamos alinhar unidade e disponibilidade da avaliação.",
        "Você recebe o próximo passo de forma objetiva no WhatsApp.",
      ]}
    />
  );
}
