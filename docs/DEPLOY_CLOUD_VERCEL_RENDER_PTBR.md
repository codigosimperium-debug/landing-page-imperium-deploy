# Deploy sem roteador: Vercel (Landing) + Render (Tracking)

Este fluxo remove dependencia de roteador/port forwarding.
Tudo roda em nuvem.

## Arquitetura final

- Landing: Vercel
- Tracking server + Postgres: Render
- Dominio final: `imperiumpendente.online`
- Painel privado: `https://imperiumpendente.online/tracking/login`

## O que ja deixei pronto no projeto

- Blueprint do Render: `render.yaml`
- Exemplo de env de producao da landing: `imperium-landing/.env.production.example`
- Script para hash da senha do painel: `scripts/generate-admin-password-hash.ps1`
- Script de checagem final do dominio: `scripts/check-domain-go-live.ps1`

## Passo 1 - Subir tracking no Render (com banco)

1. Acesse: https://dashboard.render.com
2. Clique em `New +` -> `Blueprint`.
3. Conecte seu GitHub e selecione este repositorio.
4. O Render vai detectar o `render.yaml` automaticamente.
5. Clique em `Apply`.

O Render vai criar:
1. Banco Postgres: `imperium-tracking-db`
2. Servico web: `imperium-tracking-server`

## Passo 2 - Ajustar variaveis do tracking no Render

No servico `imperium-tracking-server` -> `Environment`:

1. `ALLOWED_ORIGINS`:
`https://imperiumpendente.online,https://www.imperiumpendente.online`

2. `ADMIN_PASSWORD_HASH`:
- Gere localmente (troque a senha):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\generate-admin-password-hash.ps1 -Password "SUA_SENHA_FORTE_AQUI"
```
- Cole o valor gerado em `ADMIN_PASSWORD_HASH`.

3. Confirme `ADMIN_USERNAME` (recomendado):
`imperium-admin`

4. Clique em `Save Changes` e aguarde `Deploy successful`.

5. Copie a URL publica do tracking no Render (exemplo):
`https://imperium-tracking-server.onrender.com`

6. Teste saude:
`https://SEU_TRACKING_RENDER/health` deve retornar `{"ok":true}`.

## Passo 3 - Subir landing na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em `Add New...` -> `Project`.
3. Importe o mesmo repositorio GitHub.
4. Em `Root Directory`, selecione: `imperium-landing`.
5. Framework: `Next.js`.
6. Antes de deploy, adicione env vars de producao (copie do arquivo `imperium-landing/.env.production.example`):

Obrigatorias:
1. `NEXT_PUBLIC_WHATSAPP_NUMBER`
2. `NEXT_PUBLIC_META_PIXEL_ID`
3. `NEXT_PUBLIC_TRACKING_INGEST_URL` = `/tracking/ingest`
4. `NEXT_PUBLIC_TRACKING_PUBLIC_KEY` = valor do `TRACKING_PUBLIC_KEY` no Render
5. `TRACKING_PROXY_TARGET` = URL do tracking no Render (ex.: `https://imperium-tracking-server.onrender.com`)
6. `GOOGLE_SHEETS_ID`
7. `GOOGLE_SHEETS_RANGE` = `A:N`
8. `GOOGLE_CLIENT_EMAIL`
9. `GOOGLE_PRIVATE_KEY` (com `\n`)

7. Clique em `Deploy`.

## Passo 4 - Conectar dominio na Vercel

1. No projeto da Vercel -> `Settings` -> `Domains`.
2. Adicione:
- `imperiumpendente.online`
- `www.imperiumpendente.online`

A Vercel vai mostrar DNS esperado.
Normalmente:
1. Apex (`@`) -> `A` para `76.76.21.21`
2. `www` -> `CNAME` para `cname.vercel-dns.com`

## Passo 5 - Ajustar DNS na GoDaddy (agora para Vercel)

No GoDaddy `Manage DNS`:

1. Remova `A @` apontando para IP residencial/roteador.
2. Crie/edite:
- `A`, host `@`, valor `76.76.21.21`
- `CNAME`, host `www`, valor `cname.vercel-dns.com`

3. Salve.
4. Aguarde propagacao (5 min ate 2h).

## Passo 6 - Validacao final automatica

Rode:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-domain-go-live.ps1 -Domain imperiumpendente.online
```

Quando estiver certo, voce deve ver:
1. Dominio resolvendo
2. `https://imperiumpendente.online` respondendo
3. `https://imperiumpendente.online/tracking/login` respondendo
4. `/tracking/admin/dashboard` sem login redirecionando para login (302)

## Credenciais do painel (definidas por voce)

- Usuario: `imperium-admin`
- Senha: a que voce escolheu no passo do hash

## Se quiser, eu acompanho em tempo real

Me mande:
1. URL do tracking no Render
2. URL do deploy da Vercel

Com isso eu te retorno exatamente o que falta (se faltar) em 1 resposta.
