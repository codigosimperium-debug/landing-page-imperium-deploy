"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
};

type FormState = {
  nomeCompleto: string;
  whatsapp: string;
  unidade: string;
};

const initialState: FormState = {
  nomeCompleto: "",
  whatsapp: "",
  unidade: "",
};

export default function LeadForm({ interesse, submitLabel }: LeadFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [utmState, setUtmState] = useState<UTMState>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUtmState(getStoredUtmParams());
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

    setLoading(true);

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

      router.push("/obrigado");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao enviar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="imperium-card space-y-5 p-6 md:p-8">
      <input type="hidden" name="interesse" value={interesse} />

      <div className="space-y-1.5">
        <label htmlFor="nomeCompleto" className="text-sm font-semibold text-white">
          Nome completo
        </label>
        <input
          id="nomeCompleto"
          name="nomeCompleto"
          className="imperium-input h-12"
          value={form.nomeCompleto}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, nomeCompleto: event.target.value }))
          }
          minLength={3}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="whatsapp" className="text-sm font-semibold text-white">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          className="imperium-input h-12"
          value={form.whatsapp}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              whatsapp: formatWhatsApp(event.target.value),
            }))
          }
          placeholder="(27) 99999-9999"
          inputMode="numeric"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="unidade" className="text-sm font-semibold text-white">
          Unidade
        </label>
        <select
          id="unidade"
          name="unidade"
          className="imperium-select h-12"
          value={form.unidade}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, unidade: event.target.value }))
          }
          required
        >
          <option value="">Selecione uma unidade</option>
          <option value="Colina de Laranjeiras">Colina de Laranjeiras</option>
          <option value="Chácara Parreiral">Chácara Parreiral</option>
          <option value="Jacaraípe">Jacaraípe</option>
        </select>
      </div>

      {error ? <p className="form-error text-sm">{error}</p> : null}

      <button type="submit" className="cta-primary h-12 w-full" disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Enviando...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
