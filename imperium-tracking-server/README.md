# Imperium Tracking Server

Servidor isolado para ingestao e auditoria de eventos da landing page Imperium.

## Stack

- Node.js + Fastify
- PostgreSQL
- Knex (migrations)
- Docker / Docker Compose

## Endpoints

Publico:

- `POST /ingest` (requer `x-public-key`)

Admin JSON (privado, requer sessao de login ou `x-admin-key`):

- `GET /admin/sessions`
- `GET /admin/events`
- `GET /admin/leads`
- `GET /admin/export.csv`
- `GET /admin/dashboard` (painel visual unico, exige login)
- `GET /admin/session/:sessionId` (jornada individual)
- `GET /login` / `POST /login` / `GET /logout`

Health check:

- `GET /health`

## Eventos suportados

- `page_view`
- `click`
- `form_start`
- `form_submit`
- `form_success`
- `thank_you_view`
- `lead_created`

## Seguranca implementada

- Chave publica obrigatoria para ingestao
- Sessao `httpOnly` obrigatoria no dashboard e export CSV
- Rate limit de tentativas na rota `/login`
- Chave privada mantida para uso de API admin backend-to-backend
- Rate limit por IP no `/ingest`
- Validacao de payload com zod
- Hash de IP com SHA-256 + salt no servidor
- CORS restrito por `ALLOWED_ORIGINS`

## Banco de dados

Tabelas:

- `sessions`
- `events`
- `leads`

Migration:

- `migrations/20260303190000_init_tracking_schema.cjs`

## Variaveis de ambiente

Crie `.env` com base no `.env.example`:

```bash
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://imperium:imperium@localhost:5433/imperium_tracking
TRACKING_PUBLIC_KEY=replace-with-public-key
ADMIN_PRIVATE_KEY=replace-with-admin-key
IP_HASH_SALT=replace-with-ip-hash-salt
ALLOWED_ORIGINS=http://localhost:3000,https://imperiumpendente.online,https://www.imperiumpendente.online
INGEST_RATE_WINDOW_MS=60000
INGEST_RATE_MAX=120
```

## Rodar local (Docker)

```bash
docker compose up -d --build
```

Painel visual:

```bash
http://127.0.0.1:4000/login
```

Exemplo local:

```bash
http://127.0.0.1:4000/login
```

Teste rapido:

```bash
curl http://127.0.0.1:4000/health
```

## Rodar local (sem Docker)

```bash
npm install
npm run migrate
npm run dev
```

## Deploy producao (resumo)

1. Subir Postgres gerenciado (ou container dedicado).
2. Configurar `DATABASE_URL`, `TRACKING_PUBLIC_KEY`, `ADMIN_PRIVATE_KEY`, `IP_HASH_SALT`, `ALLOWED_ORIGINS`.
3. Executar migration:
   - `npm run migrate`
4. Subir aplicacao:
   - `npm run build && npm run start`
5. Expor publicamente:
   - `/ingest` para o site (com `x-public-key`)
   - `/login` e `/admin/*` somente para admin autenticado.
