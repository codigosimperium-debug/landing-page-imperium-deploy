import Link from "next/link";

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  ? `https://wa.me/55${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
  : "#";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-2)] bg-[var(--color-8)] py-10">
      <div className="imperium-container grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-6)]">Imperium Academia</p>
          <p className="mt-3 max-w-sm text-sm text-[var(--color-1)]">
            Atendimento estruturado com método, organização e presença técnica em cada sessão.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contato</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-1)]">
            <a href={whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Navegação</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-1)]">
            <Link href="/pilates">Pilates</Link>
            <Link href="/eletroestimulacao">Eletroestimulação</Link>
            <Link href="/treinamento-funcional">Treinamento Funcional</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
