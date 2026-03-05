"use client";

export type UnitLocation = {
  id: "jacaraipe" | "parreiral" | "colina";
  nome: string;
  bairro: string;
  enderecoResumo: string;
  cep: string;
  enderecoCompleto: string;
};

type UnitCardsProps = {
  units: UnitLocation[];
  onSelect: (unit: UnitLocation) => void;
};

export default function UnitCards({ units, onSelect }: UnitCardsProps) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      {units.map((unit) => (
        <article key={unit.id} className="imperium-card unit-card p-5 md:p-6">
          <div className="unit-card-head">
            <span className="unit-card-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="unit-card-kicker">{unit.bairro}</p>
              <h3 className="mt-2 text-xl text-white">{unit.nome}</h3>
              <p className="mt-2 text-sm">{unit.enderecoResumo}</p>
              <p className="mt-1 text-sm text-[var(--muted)]/90">CEP {unit.cep}</p>
            </div>
          </div>

          <button
            type="button"
            className="cta-secondary mt-5 w-full"
            onClick={() => onSelect(unit)}
            data-track-click={`unit_open_${unit.id}`}
            aria-label={`Ver localização da unidade ${unit.nome}`}
          >
            Ver localização
          </button>
        </article>
      ))}
    </div>
  );
}
