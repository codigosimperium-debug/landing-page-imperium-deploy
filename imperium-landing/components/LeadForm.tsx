"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getStoredUtmParams, type UTMState } from "@/lib/utm";
import {
  type InterestType,
  type LeadPayload,
  formatWhatsApp,
  validateLeadPayload,
} from "@/lib/validators";

type LeadFormProps = {
  interesse: InterestType;
  submitLabel: string;
  imageSrc?: string;
  imageAlt?: string;
};

type FormState = {
  nomeCompleto: string;
  whatsapp: string;
  email: string;
  unidade: string;
  objetivoPrincipal: string;
};

type SubmitState = "idle" | "sending" | "confirmed";

const initialState: FormState = {
  nomeCompleto: "",
  whatsapp: "",
  email: "",
  unidade: "",
  objetivoPrincipal: "",
};

const REDIRECT_BY_INTEREST: Record<InterestType, string> = {
  Pilates: "/obrigado/pilates",
  Eletroestimulação: "/obrigado/eletroestimulacao",
  "Treinamento Funcional": "/obrigado/treinamento-funcional",
};

export default function LeadForm({
  interesse,
  submitLabel,
  imageSrc,
  imageAlt = "Espaço da Imperium Academia",
}: LeadFormProps) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialState);
  const [utmState, setUtmState] = useState<UTMState>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  });
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setUtmState(getStoredUtmParams());
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const payload = useMemo(
    () => ({
      ...form,
      interesse,
      page_path: typeof window === "undefined" ? "" : window.location.pathname,
      user_agent: typeof navigator === "undefined" ? "" : navigator.userAgent,
      ...utmState,
    }),
    [form, interesse, utmState],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState !== "idle") {
      return;
    }

    setError("");

    const validation = validateLeadPayload({
      ...payload,
      created_at: new Date().toISOString(),
      ip: "127.0.0.1",
    } as LeadPayload);

    if (!validation.ok) {
      setError(validation.errors[0] ?? "Revise os campos e tente novamente.");
      return;
    }

    setSubmitState("sending");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível enviar agora.");
      }

      setSubmitState("confirmed");
      setProgress(shouldReduceMotion ? 100 : 12);

      if (!shouldReduceMotion) {
        intervalRef.current = window.setInterval(() => {
          setProgress((prev) => {
            const next = prev + 4;
            if (next >= 100) {
              if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return 100;
            }
            return next;
          });
        }, 85);
      }

      timeoutRef.current = window.setTimeout(
        () => {
          router.push(REDIRECT_BY_INTEREST[interesse]);
        },
        shouldReduceMotion ? 280 : 2300,
      );
    } catch (submitError) {
      setSubmitState("idle");
      setProgress(0);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao enviar. Tente novamente.",
      );
    }
  }

  const buttonText =
    submitState === "sending"
      ? "Enviando..."
      : submitState === "confirmed"
        ? "Cadastro confirmado"
        : submitLabel;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <form onSubmit={onSubmit} noValidate className="imperium-card lead-console space-y-4 p-6 md:p-8">
        <input type="hidden" name="interesse" value={interesse} />

        <div className="space-y-1.5">
          <label htmlFor="nomeCompleto" className="text-sm font-semibold text-white">
            Nome completo
          </label>
        <input
            id="nomeCompleto"
            name="nomeCompleto"
            className="imperium-input h-[48px]"
            value={form.nomeCompleto}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nomeCompleto: event.target.value }))
            }
          minLength={3}
          disabled={submitState !== "idle"}
          required
        />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="whatsapp" className="text-sm font-semibold text-white">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              className="imperium-input h-[48px]"
              value={form.whatsapp}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  whatsapp: formatWhatsApp(event.target.value),
                }))
              }
              placeholder="(27) 99999-9999"
              inputMode="numeric"
              disabled={submitState !== "idle"}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-white">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="imperium-input h-[48px]"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="voce@exemplo.com"
              disabled={submitState !== "idle"}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="unidade" className="text-sm font-semibold text-white">
            Unidade
          </label>
          <select
            id="unidade"
            name="unidade"
            className="imperium-select h-[48px]"
            value={form.unidade}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, unidade: event.target.value }))
            }
            disabled={submitState !== "idle"}
            required
          >
            <option value="">Selecione uma unidade</option>
            <option value="Colina de Laranjeiras">Colina de Laranjeiras</option>
            <option value="Chácara Parreiral">Chácara Parreiral</option>
            <option value="Jacaraípe">Jacaraípe</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="objetivoPrincipal" className="text-sm font-semibold text-white">
            Objetivo principal
          </label>
          <textarea
            id="objetivoPrincipal"
            name="objetivoPrincipal"
            className="imperium-textarea min-h-[116px]"
            value={form.objetivoPrincipal}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, objetivoPrincipal: event.target.value }))
            }
            minLength={3}
            maxLength={120}
            disabled={submitState !== "idle"}
            required
          />
        </div>

        {error ? <p className="form-error text-sm">{error}</p> : null}

        {submitState === "confirmed" ? (
          <div className="submit-confirmation">
            <span className="submit-badge">Cadastro confirmado</span>
            <div className="submit-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          className="cta-primary h-[48px] w-full"
          disabled={submitState !== "idle"}
        >
          {submitState === "sending" ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {buttonText}
            </span>
          ) : (
            buttonText
          )}
        </button>
      </form>

      <aside className="imperium-card protocol-panel p-6 md:p-7">
        <p className="protocol-kicker text-xs uppercase tracking-[0.18em]">Protocolo Imperium</p>
        <h3 className="mt-2 text-2xl md:text-[1.65rem]">Protocolo de Atendimento</h3>
        <p className="mt-3 text-sm md:text-base">Atenção não é promessa. É método.</p>

        <ol className="mt-5 space-y-3 text-sm md:text-base">
          <li>
            <span>1)</span> Diagnóstico objetivo (na avaliação)
          </li>
          <li>
            <span>2)</span> Acompanhamento setorizado (durante o treino)
          </li>
          <li>
            <span>3)</span> Direção de evolução (organizada e clara)
          </li>
        </ol>

        {imageSrc ? (
          <div className="protocol-image-slot mt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="protocol-image-slot mt-5 protocol-image-placeholder">
            Espaço para imagem institucional
          </div>
        )}
      </aside>
    </div>
  );
}
