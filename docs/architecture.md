# Arquitetura — Coach de Cultivo

Visão consolidada para agentes de IDE e humanos novos no projeto.

---

## Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                  PWA Next.js 14 (Vercel)                    │
│   app router • Tailwind • lucide-react • client components  │
│   lib/api.ts → único ponto de rede                          │
└────────────────────────────┬────────────────────────────────┘
                             │  fetch + X-API-Token
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Flask API (Render — plano Free)                │
│   create_app() factory • blueprints • services singleton    │
│   ┌─────────────┐  ┌───────────────┐  ┌───────────────┐     │
│   │ cycles      │  │ logs          │  │ coach_today   │     │
│   │ + setup     │  │ + photo       │  │ (orquestra)   │     │
│   │ + strain    │  │   upload      │  │               │     │
│   └──────┬──────┘  └───────┬───────┘  └───────┬───────┘     │
│          │                 │                  │             │
│   ┌──────┴─────────────────┴──────────────────┴─────┐       │
│   │  services/                                      │       │
│   │  firebase_service • gemini_provider             │       │
│   │  coach_service • strain_service                 │       │
│   └──────┬─────────────────┬──────────────────┬─────┘       │
└──────────┼─────────────────┼──────────────────┼─────────────┘
           │                 │                  │
           ▼                 ▼                  ▼
     Firestore          Firebase Storage   Gemini 2.0 Flash
     (cycles, logs,     (fotos .jpg)       (vision + coach +
      strain_profile)                       google_search_retrieval)
           ▲
           │ imports (PYTHONPATH)
           │
┌──────────┴──────────────────────────────────────────────────┐
│            coach_de_cultivo_core/ (lib pura)                │
│   models (frozen dataclasses) • phase_engine • rules        │
│   yield_estimator • coach orchestrator • prompts • parser   │
│   zero I/O, 100% testável, pytest 100% passando             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo do dia (happy path)

1. Usuário abre PWA → `GET /coach/today?cycle_id=X` via `lib/api.ts`.
2. Blueprint chama `CoachService.report_for_today(X)`.
3. `CoachService`:
   - busca ciclo + últimos N logs no Firestore;
   - chama `coach.compose_report(...)` do core (regras + yield);
   - se houver foto do dia, chama `GeminiProvider.analyze_photo(...)`
     e funde o diagnóstico visual no `CoachReport`.
4. Retorna `CoachReport` serializado.
5. UI renderiza: `PhaseBadge`, `AlertList`, `RecommendationCard`, `YieldCard`.

## Fluxo de pesquisa de genética

1. Usuário vai em **/settings → Genética → Pesquisar com IA**.
2. `POST /cycles/<id>/strain-research` → `StrainService.research_and_save(...)`
3. Service monta prompt via `coach.prompts.build_strain_research_prompt(...)`.
4. `GeminiProvider.research_strain(prompt)`:
   - cria modelo com `tools="google_search_retrieval"` + `temp=0.3`;
   - invoca `generate_content(prompt)`;
   - extrai fontes via `response.candidates[].grounding_metadata.grounding_chunks[].web.uri`.
5. `StrainService` parseia via `strain_parser.parse_strain_profile(...)`
   (defensivo: nunca levanta exceção, sempre retorna `StrainProfile`).
6. Salva em `cycles/{id}/meta/strain_profile` no Firestore.
7. UI renderiza `StrainCard` com os dados.

---

## Contratos

- **REST → types:** qualquer mudança em `backend/app/blueprints/`
  propaga para `frontend/lib/types.ts` + `frontend/lib/api.ts` **no mesmo
  commit**. Nunca commite contrato quebrado.
- **Core → backend:** `coach_de_cultivo_core/src/` é importado com
  `PYTHONPATH=../coach_de_cultivo_core/src`. O backend nunca duplica regra.
- **Gemini:** só passa por `backend/app/services/gemini_provider.py`.

---

## Stack de deploy

| Componente | Onde                       | Custo   | Obs                                   |
|------------|----------------------------|---------|---------------------------------------|
| Firestore  | GCP (Firebase)             | Free    | 1 GB / 50k reads / 20k writes dia     |
| Storage    | GCP (Firebase)             | Free    | 5 GB / 1 GB download dia              |
| Gemini     | AI Studio                  | Free    | 15 RPM / 1500 RPD no flash            |
| Flask      | Render                     | Free    | Spin-down após 15min idle             |
| Next.js    | Vercel                     | Free    | 100 GB bandwidth/mês                  |

Total: **R$ 0,00 / mês** dentro de uso pessoal.

---

## Módulos e responsabilidades

Ver:
- [AGENTS.md raiz](../AGENTS.md) — regras globais + índice
- [core/AGENTS.md](../coach_de_cultivo_core/AGENTS.md)
- [backend/AGENTS.md](../backend/AGENTS.md)
- [frontend/AGENTS.md](../frontend/AGENTS.md)

---

## Decisões arquiteturais registradas

1. **Core em Python puro, sem I/O.** Justificativa: regras precisam ser
   testáveis offline, reusáveis em CLI/notebook, e independentes de Flask
   ou Firebase caso mudemos de stack.
2. **Firestore em vez de SQLite.** Justificativa: ciclo de uso inclui
   acesso do celular em campo, sincronização entre desktop e mobile, sem
   servidor DB operado. Firestore Free bastante para single-user.
3. **Gemini 2.0 Flash em vez de 1.5 Pro.** Justificativa: Flash tem
   grounding `google_search_retrieval` nativo + preço zero no free-tier.
   Pro teria que usar paid API.
4. **Next.js App Router em vez de Pages.** Justificativa: padrão atual
   do Next 14, server components gratuitos, streaming nativo. Custo:
   alguns componentes viram `"use client"` por precisar de estado.
5. **Tailwind puro sem CSS solto.** Justificativa: consistência com
   preferência do dono do projeto + shadcn/ui casa perfeitamente.
