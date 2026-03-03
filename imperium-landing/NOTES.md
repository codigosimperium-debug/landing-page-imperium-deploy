# Imperium Landing Notes

## Logo transparente no header

O header tenta carregar os assets nesta ordem:

1. `/public/logo-imperium-transparent.png`
2. `/public/logo-imperium.png` (fallback automático)

Isso mantém o fluxo seguro sem perder a marca original.

## Como trocar a logo final

1. Exporte a versão oficial transparente da marca em PNG.
2. Salve como `logo-imperium-transparent.png` em `/public`.
3. Mantenha `logo-imperium.png` intacto como backup.
4. Reinicie o servidor (`npm run dev`) para validar no header.

## Observação

O arquivo `logo-imperium-transparent.png` atual foi gerado por keying do fundo cinza.
Se o time de design enviar um PNG transparente oficial, substitua esse arquivo.
