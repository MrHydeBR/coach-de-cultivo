# Agent context — frontend PWA (`frontend/`)

Next.js 14 (App Router) + TypeScript estrito + Tailwind + lucide-react.
Deploy em **Vercel Hobby**. Mobile-first, instalável (PWA).

---

## Estrutura

```
frontend/
├── app/
│   ├── layout.tsx           # root layout + <Navbar/>
│   ├── page.tsx             # dashboard (coach do dia)
│   ├── cycle/new/page.tsx   # criar ciclo
│   ├── log/new/page.tsx     # registrar rega + foto
│   ├── history/page.tsx     # timeline de logs
│   └── settings/page.tsx    # aba Ajustes + Genética
├── components/
│   ├── Navbar.tsx
│   ├── PhaseBadge.tsx
│   ├── AlertList.tsx
│   ├── RecommendationCard.tsx
│   ├── YieldCard.tsx
│   ├── PpmDeltaChart.tsx
│   ├── IrrigationForm.tsx
│   ├── PhotoUploader.tsx
│   ├── SetupEditor.tsx
│   ├── StrainCard.tsx
│   └── StrainResearchButton.tsx
├── lib/
│   ├── api.ts               # client REST (único ponto de rede)
│   ├── types.ts             # contrato com o backend
│   └── utils.ts             # cn(), helpers
├── public/
│   ├── manifest.json
│   └── icons/
├── tailwind.config.ts       # paleta canopy/bark customizada
├── next.config.mjs
├── tsconfig.json
└── vercel.json
```

---

## Regras desta pasta

1. **TS estrito, zero `any`.** Todo tipo de API vem de `lib/types.ts`.
2. **Tailwind puro.** Sem CSS solto, sem styled-components, sem emotion.
   Use `cn()` de `lib/utils.ts` para mesclar classes condicionais.
3. **Componentes funcionais + hooks.** Nada de class components.
4. **`"use client"` só quando precisa** (estado, effect, evento).
   Páginas de leitura tentam ser server components primeiro.
5. **Handlers nomeados `handleX`:** `handleSubmit`, `handleKeyDown`,
   `handleChange`, etc. Arrow functions: `const handleX = () => { ... }`.
6. **Acessibilidade obrigatória em interativos:**
   `tabIndex={0}`, `role`, `aria-label`, `onKeyDown` para tecla Enter.
7. **Ícones via `lucide-react`**, tipados como `LucideIcon` quando passados
   como prop (ver `AlertList.tsx`).
8. **Rede só pelo `lib/api.ts`.** Nunca `fetch` direto em componente.
9. **Estado global é zustand** se precisar. Hoje não precisa — tudo local.
10. **PT-BR na UI**, inglês no código.

---

## Paleta (Tailwind customizada)

| Token       | Uso                        |
|-------------|----------------------------|
| `canopy-*`  | Verde folha (ações +)      |
| `bark-*`    | Marrom madeira (neutro)    |
| `amber/red/sky` | alertas (severity)     |

Dark mode é variante `dark:`. Sempre incluir versão dark quando aplicar
cor de fundo ou texto.

---

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # valida TS + gera produção
npm run lint       # ESLint + Prettier
npm run typecheck  # tsc --noEmit
```

---

## Fluxo de contrato com o backend

Qualquer mudança em `backend/app/blueprints/` **exige**:

1. Atualizar tipo em `lib/types.ts`.
2. Atualizar função em `lib/api.ts`.
3. Atualizar componente consumidor.
4. `npm run build` passando.

No mesmo commit, sempre.

---

## Anti-patterns

- `fetch('/api/...')` direto em `page.tsx` ou componente.
- `useState<any>` ou cast `as unknown as X` fora de conversões de API
  pré-tipadas.
- Inline styles (`style={{...}}`). Use Tailwind.
- Ternários complexos em className. Use `cn()` com variantes condicionais
  ou `class:` utilities.
- Componentes acima de 200 linhas. Divida.
- Dados sensíveis em `NEXT_PUBLIC_*`. Só vai o que é seguro expor.
