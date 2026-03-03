# Imperium Landing Notes

## Logo no Header

O header usa esta ordem de tentativa:

1. `/public/logo-imperium-transparent.png` (preferencial)
2. `/public/logo-imperium.png` (fallback)

A estrutura visual já está preparada para logo sem fundo aparente.

## Como atualizar corretamente

1. Exporte a logo oficial em PNG com transparência real.
2. Salve como `logo-imperium-transparent.png` na pasta `/public`.
3. Mantenha `logo-imperium.png` como backup, sem alterar proporção.
4. Reinicie o projeto para validar o resultado no header.

## Regra de qualidade

Se só houver logo com fundo sólido, não force remoção visual por CSS.
A troca deve ser feita com asset transparente oficial.
