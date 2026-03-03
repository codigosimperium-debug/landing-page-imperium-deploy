import ThankYouView from "@/components/ThankYouView";

export default function ObrigadoFuncionalPage() {
  return (
    <ThankYouView
      title="Treinamento Funcional confirmado."
      description="Cadastro recebido. Vamos organizar seu início com método e direção."
      bullets={[
        "Nossa equipe define sua melhor unidade para avaliação.",
        "Você recebe confirmação e instruções do primeiro atendimento.",
      ]}
    />
  );
}
