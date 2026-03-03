"use client";

const defaultMessage =
  "Quero agendar uma avaliação na Imperium Academia";

export default function WhatsAppFloating() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!number) {
    return null;
  }

  const href = `https://wa.me/55${number}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-2)] bg-[var(--color-4)] text-xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#0c3e70]"
    >
      WA
    </a>
  );
}
