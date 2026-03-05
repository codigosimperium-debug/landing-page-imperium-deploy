# GoDaddy - Passo a Passo Completo (Landing + Painel Tracking)

Este guia e para publicar a landing Imperium e o painel privado no dominio:

- imperiumpendente.online
- www.imperiumpendente.online

## 1) Pre-requisitos obrigatorios

Antes do DNS, confirme:

1. O dominio existe na sua conta GoDaddy (nome exato: `imperiumpendente.online`).
2. Voce tem um servidor com IP publico fixo para hospedar o site.
3. Esse servidor aceita conexoes nas portas 80 e 443.
4. O projeto esta rodando no servidor (Next + tracking).

Observacao:
- Se o dominio ainda aparecer como NXDOMAIN, o registro ainda nao finalizou no registro.br/ICANN ou ainda nao propagou.

## 2) Descobrir o IP publico do servidor

No servidor onde a landing roda, execute:

```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
```

Guarde esse IP. Exemplo: `203.0.113.10`.

## 3) GoDaddy - configurar DNS (clique a clique)

1. Acesse: https://godaddy.com
2. Clique em `My Products`.
3. Em `Domains`, localize `imperiumpendente.online`.
4. Clique em `DNS` ou `Manage DNS`.

### 3.1) Registro raiz (@)

1. Em `Records`, clique em `Add`.
2. Type: `A`
3. Name/Host: `@`
4. Value/Points to: `SEU_IP_PUBLICO`
5. TTL: `1 Hour` (ou 600s se tiver opcao menor)
6. Salve.

Se ja existir um `A` para `@` apontando para outro lugar:
- Edite esse registro para o novo IP, ou remova e crie o correto.

### 3.2) Registro www

1. Clique em `Add`.
2. Type: `CNAME`
3. Name/Host: `www`
4. Value/Points to: `@`
5. TTL: `1 Hour`
6. Salve.

Se houver conflito (ex.: `A` com host `www`), remova o conflito antes.

## 4) Aguardar propagacao DNS

Tempo comum: 5 minutos a 2 horas.
Em alguns casos: ate 24 horas.

Voce pode validar com:

```powershell
nslookup imperiumpendente.online
nslookup www.imperiumpendente.online
```

## 5) SSL/HTTPS

Quando DNS estiver propagado, habilite HTTPS no servidor/proxy.

Opcao recomendada:
- Nginx + Certbot (Let's Encrypt).

Se estiver em plataforma (Vercel/Render/Railway), o SSL geralmente e automatico apos dominio apontado.

## 6) Variaveis de ambiente de producao

### Landing (Next)

```env
NEXT_PUBLIC_TRACKING_INGEST_URL=/tracking/ingest
NEXT_PUBLIC_TRACKING_PUBLIC_KEY=<SUA_PUBLIC_KEY>
TRACKING_PROXY_TARGET=http://127.0.0.1:4000
```

### Tracking server

```env
ALLOWED_ORIGINS=https://imperiumpendente.online,https://www.imperiumpendente.online
ADMIN_USERNAME=imperium-admin
ADMIN_PASSWORD_HASH=<hash>
ADMIN_SESSION_SECRET=<secret-forte>
ADMIN_SESSION_HOURS=12
```

## 7) Validacao automatica (script pronto)

Depois de configurar DNS, execute no projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-domain-go-live.ps1 -Domain imperiumpendente.online
```

Se quiser conferir IP esperado:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-domain-go-live.ps1 -Domain imperiumpendente.online -ExpectedIp SEU_IP_PUBLICO
```

Esse script valida automaticamente:
- DNS de `@` e `www`
- HTTPS do dominio
- `/tracking/login`
- Protecao do dashboard e do export CSV (302 sem login)

## 8) Checklist final

- [ ] `imperiumpendente.online` abre com HTTPS
- [ ] `www.imperiumpendente.online` redireciona/abre correto
- [ ] `/tracking/login` abre
- [ ] `/tracking/admin/dashboard` sem login redireciona para login
- [ ] `/tracking/admin/export.csv` sem login nao e publico
- [ ] Formulario envia lead e grava no Sheets
- [ ] `/obrigado/*` dispara Lead (Pixel)

## 9) Se nao funcionar

1. Verifique conflito de DNS (A/CNAME duplicado).
2. Verifique firewall/porta 80 e 443 do servidor.
3. Verifique se seu servidor realmente esta ouvindo na porta publica.
4. Rode o script de checagem e me envie a saida.
