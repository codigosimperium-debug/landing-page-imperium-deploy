import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  alt?: boolean;
  children: ReactNode;
};

export default function Section({
  id,
  title,
  subtitle,
  alt = false,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`imperium-section ${alt ? "imperium-section-alt" : ""}`}>
      <div className="imperium-container">
        <div className="space-y-4">
          {subtitle ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{subtitle}</p>
          ) : null}
          <h2 className="text-3xl md:text-4xl">{title}</h2>
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
