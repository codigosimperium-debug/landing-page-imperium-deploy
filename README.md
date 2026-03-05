# Landing-Page-Imperium

Monorepo com dois servicos:

- `imperium-landing`: site Next.js da Imperium (rotas, formularios, Google Sheets, Pixel, UX premium).
- `imperium-tracking-server`: tracking proprio isolado (ingestao de eventos + auditoria em Postgres).

## Rodar local

1. Suba o tracking server:
   - `cd imperium-tracking-server`
   - `docker compose up -d --build`
2. Suba a landing:
   - `cd ../imperium-landing`
   - `npm install`
   - `npm run dev`

## Acesso unico de metricas

- Dashboard visual: `http://127.0.0.1:4000/login`
- Jornada por individuo: clique na sessao dentro do dashboard

## Estrutura

- `imperium-landing/README.md`: setup da landing e envs.
- `imperium-tracking-server/README.md`: setup do tracking server, endpoints e seguranca.
- `docs/GODADDY_DEPLOY_PTBR.md`: passo a passo detalhado para publicar dominio na GoDaddy.
- `docs/DEPLOY_CLOUD_VERCEL_RENDER_PTBR.md`: deploy em nuvem sem roteador (Vercel + Render).
- `scripts/check-domain-go-live.ps1`: validacao automatica de DNS/HTTPS/painel privado.
- `scripts/start-temp-public.ps1`: gera URL publica temporaria (Cloudflare Tunnel).
- `scripts/generate-admin-password-hash.ps1`: gera hash scrypt da senha do painel privado.
