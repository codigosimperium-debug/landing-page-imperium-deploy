"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { captureAndStoreUtmParams } from "@/lib/utm";

const navLinks = [
  { href: "/#metodo", label: "Método" },
  { href: "/#unidades", label: "Unidades" },
  { href: "/pilates", label: "Pilates" },
  { href: "/eletroestimulacao", label: "Eletroestimulação" },
  { href: "/treinamento-funcional", label: "Treinamento Funcional" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    captureAndStoreUtmParams();
  }, []);

  return (
    <header className="header-blur fixed inset-x-0 top-0 z-50">
      <div className="imperium-container">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <div
              className="rounded-lg border px-[14px] py-[10px]"
              style={{
                background: "#3D3D3D",
                borderColor: "var(--color-2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-imperium.png"
                alt="Imperium Academia"
                width={154}
                height={28}
                loading="eager"
                fetchPriority="high"
                className="h-6 w-auto object-contain md:h-7"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[var(--color-1)] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link href="/#servicos" className="cta-primary text-sm">
              Agendar Avaliação
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-2)] bg-[var(--color-11)] lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--color-2)] bg-[var(--color-5)] lg:hidden">
          <div className="imperium-container py-5">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--color-2)] bg-[var(--color-11)] px-4 py-3 font-semibold text-[var(--color-1)]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/#servicos"
              className="cta-primary mt-4 w-full"
              onClick={() => setMenuOpen(false)}
            >
              Agendar Avaliação
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
