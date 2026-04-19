# Tasks — Missões de implantação

Cada arquivo numerado é uma missão executável ponta-a-ponta. Rode na ordem:

| # | Missão                                              | Tempo | O que entrega                          |
|---|-----------------------------------------------------|-------|----------------------------------------|
| 1 | [Provisionar Firebase](./01-firebase.md)            | 10min | Firestore + Storage + service account  |
| 2 | [Configurar Gemini](./02-gemini.md)                 | 5min  | API key + smoke tests                  |
| 3 | [Gerar API token](./03-api-token.md)                | 2min  | Auth entre front e back                |
| 4 | [Deploy Render (backend)](./04-deploy-render.md)    | 15min | Flask online                           |
| 5 | [Deploy Vercel (frontend)](./05-deploy-vercel.md)   | 10min | PWA online e instalável                |
| 6 | [Seed do ciclo 24K Gold](./06-seed-data.md)         | 3min  | Dados históricos no Firestore          |
| 7 | [Validação end-to-end](./07-verify-e2e.md)          | 5min  | Sistema completo funcionando           |

Tempo total: ~50 min.

---

## Como executar via Antigravity IDE

No painel de agente, diga:

```
Execute tasks/01 a 07 em sequência. Pare antes de cada passo destrutivo
(push para Git, deploy, gravação em Firestore) para eu aprovar o diff.
```

O agente vai percorrer cada `.md`, lendo o contexto do `AGENTS.md` raiz e
dos scoped quando entrar em cada pasta.
