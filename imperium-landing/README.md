# Imperium Landing

Landing page institucional e de captacao da Imperium, em Next.js (App Router).

## Rotas principais

- `/` (home sem formulario)
- `/pilates`
- `/eletroestimulacao`
- `/treinamento-funcional`
- `/obrigado`
- `/obrigado/pilates`
- `/obrigado/eletroestimulacao`
- `/obrigado/treinamento-funcional`

## Captacao de leads

- Formulario nas paginas de servico
- API: `POST /api/lead`
- Persistencia principal de leads: Google Sheets
- Campos de UTM capturados e enviados
- `objetivoPrincipal` removido do formulario e da planilha

## Tracking proprio (DB)

Cliente:

- `lib/trackingClient.ts`
- Session id persistida em localStorage/cookie
- Eventos:
  - `page_view`
  - `click`
  - `form_start`
  - `form_submit`
  - `form_success`
  - `thank_you_view`

Servidor Next:

- `app/api/lead/route.ts` envia `lead_created` para tracking server (best effort, sem quebrar o fluxo do lead)
- `app/tracking/[...path]/route.ts` faz proxy do painel e ingest para manter tudo no mesmo dominio (`/tracking/*`)

## Variaveis de ambiente

`.env.local`:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=27999999999
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TRACKING_INGEST_URL=/tracking/ingest
NEXT_PUBLIC_TRACKING_PUBLIC_KEY=local-public-key
TRACKING_PROXY_TARGET=http://127.0.0.1:4000

GOOGLE_SHEETS_ID=...
GOOGLE_SHEETS_RANGE=A:N
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Rodar local

1. Suba tracking server e postgres:
   - `cd ../imperium-tracking-server`
   - `docker compose up -d --build`
2. Rode a landing:
   - `cd ../imperium-landing`
   - `npm install`
   - `npm run dev`
3. Acesse:
   - `http://localhost:3000`

## Build producao

```bash
npm run lint
npm run build
npm run start
```
