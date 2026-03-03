"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type ServiceCardProps = {
  href: string;
  title: string;
  description: string;
  icon: "pilates" | "ems" | "funcional";
  buttonLabel?: string;
};

function ServiceIcon({ icon }: Pick<ServiceCardProps, "icon">) {
  if (icon === "pilates") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="7" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "ems") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M13.8 2 5.5 13h4.8L9.8 22l8.7-11.2h-4.7L13.8 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2.5 10h3v4h-3M18.5 10h3v4h-3M7.5 11.2h9M7.5 12.8h9M6 9h1.5v6H6M16.5 9H18v6h-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ServiceCard({
  href,
  title,
  description,
  icon,
  buttonLabel = "Saiba Mais",
}: ServiceCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="imperium-card service-card p-6"
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-2)] bg-[var(--color-12)] px-3 py-1 text-[var(--color-1)]">
        <ServiceIcon icon={icon} />
        <span className="text-xs font-semibold uppercase tracking-[0.12em]">Serviço</span>
      </div>

      <h3 className="mt-5 text-2xl text-white">{title}</h3>
      <p className="mt-3 text-sm md:text-base">{description}</p>

      <Link href={href} className="cta-primary mt-6 w-full text-center">
        {buttonLabel}
      </Link>
    </motion.article>
  );
}
