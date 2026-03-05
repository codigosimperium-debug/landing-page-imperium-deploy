"use client";

const defaultMessage = "Quero agendar uma avaliação na Imperium Academia";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 2.8a9.2 9.2 0 0 0-7.9 14l-1 4.4 4.5-1a9.2 9.2 0 1 0 4.4-17.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 8.9c.2-.4.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5 0 .7l-.4.7c-.1.2-.1.4 0 .5.5.8 1.2 1.5 2 2 .2.1.4.1.5 0l.8-.4c.2-.1.4-.1.7 0l1.8.8c.3.1.4.3.4.5v.6c0 .3-.2.5-.5.7-.6.3-1.2.4-1.8.2-3-.9-5.4-3.3-6.3-6.3-.2-.6-.1-1.2.2-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
      data-track-click="whatsapp_floating"
      className="whatsapp-floating fixed bottom-5 right-5 z-40 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[var(--color-2)] bg-[var(--color-4)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors duration-200 md:h-14 md:w-14"
    >
      <WhatsAppIcon />
      <span className="whatsapp-tooltip" role="tooltip">
        WhatsApp
      </span>
    </a>
  );
}
