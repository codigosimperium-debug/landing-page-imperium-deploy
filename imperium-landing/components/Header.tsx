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
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/logo-imperium-transparent.png");
  const [logoTextFallback, setLogoTextFallback] = useState(false);

  useEffect(() => {
    captureAndStoreUtmParams();

    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogoError = () => {
    if (logoSrc === "/logo-imperium-transparent.png") {
      setLogoSrc("/logo-imperium.png");
      return;
    }

    setLogoTextFallback(true);
  };

  return (
    <header
      className={`header-blur fixed inset-x-0 top-0 z-50 ${isScrolled ? "header-blur-scrolled" : ""}`}
    >
      <div className="imperium-container">
        <div className="flex h-[92px] items-center justify-between gap-4">
          <Link href="/" className="brand-logo focus-visible:outline-none">
            {logoTextFallback ? (
              <span className="text-base font-semibold text-white md:text-lg">
                Imperium Academia
              </span>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="Imperium Academia"
                  width={236}
                  height={42}
                  loading="eager"
                  fetchPriority="high"
                  className="h-[34px] w-auto object-contain md:h-[42px]"
                  onError={handleLogoError}
                />
              </>
            )}
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="header-link"
                data-track-click={`header_nav_${link.label}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/#servicos"
              className="cta-primary text-sm"
              data-track-click="header_cta_agendar"
            >
              Agendar Avaliação
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface2)] transition-colors hover:border-[var(--accent)] lg:hidden"
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
        <div className="border-t border-[var(--border)] bg-[var(--bg)] lg:hidden">
          <div className="imperium-container py-5">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 font-semibold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-white"
                  data-track-click={`mobile_nav_${link.label}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/#servicos"
              className="cta-primary mt-4 w-full"
              data-track-click="mobile_cta_agendar"
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
