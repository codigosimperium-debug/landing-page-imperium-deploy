"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.header
      className={`header-blur fixed inset-x-0 top-0 z-50 ${isScrolled ? "header-blur-scrolled" : ""}`}
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="imperium-container">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="brand-logo focus-visible:outline-none">
            {logoTextFallback ? (
              <span className="text-base font-semibold text-white md:text-lg">Imperium Academia</span>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="Imperium Academia"
                  width={160}
                  height={28}
                  loading="eager"
                  fetchPriority="high"
                  className="h-6 w-auto object-contain md:h-7"
                  onError={handleLogoError}
                />
              </>
            )}
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="header-link">
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-2)] bg-[var(--color-11)] transition-colors hover:border-[var(--color-13)] lg:hidden"
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
        <motion.div
          className="border-t border-[var(--color-2)] bg-[var(--color-5)] lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="imperium-container py-5">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--color-2)] bg-[var(--color-11)] px-4 py-3 font-semibold text-[var(--color-1)] transition-colors hover:border-[var(--color-13)] hover:text-white"
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
        </motion.div>
      ) : null}
    </motion.header>
  );
}
