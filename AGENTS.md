# Agent context — Coach de Cultivo

> Este arquivo é lido automaticamente pelo **Google Antigravity IDE** (e compatíveis)
> a cada sessão de agente. Ele define o contrato de como trabalhar neste projeto.

---

## 1. O que é este projeto

App pessoal de coach de cultivo indoor de cannabis medicinal. O dono do cultivo
(Mauro) envia rega + foto do dia via PWA mobile, e o sistema devolve:

- Diagnóstico visual (IA multimodal: Gemini 2.0 Flash)
- Alertas acionáveis (regras determinísticas em Python)
- Ações recomendadas para 24h e 3–5 dias
- Estimativa de yield (modelo híbrido VPD × PPFD × genética)
- Pesquisa de genética com Google Search grounding (Gemini 2.0)

**Ciclo ativo de referência:** `24K Gold Fev26` (Kosher Kush × Tangie),
tenda 75×50×40 cm, quantum board 65 W, substrato de coco, nutrientes EasyCoco A+B+C.

Toda infraestrutura é **free-tier**: Firebase Spark, Render Free, Vercel Hobby,
Gemini AI Studio. Custo-alvo ≤ R$ 0/mês.

---

## 2. Arquitetura em uma visão

```
┌─────────────────────────┐         ┌────────────────────────┐
│  Next.js 14 (Vercel)    │  HTTPS  │ Flask API (Render)     │
│  app/ + Tailwind + PWA  │ ◄─────► │ app factory + blueprint│
└─────────────────────────┘         └──────────┬─────────────┘
                                               │
                                     ┌─────────┼─────────┐
                                     │         │         │
                                     ▼         ▼         ▼
                             ┌────────────┐ ┌───────┐ ┌────────────┐
                             │ Firestore  │ │ GCS   │ │ Gemini 2.0 │
                             │ (cycles/   │ │ fotos │ │ vision +   │
                             │  logs/     │ └───────┘ │ coach +    │
                             │  strain)   │           │ grounding) │
                             └────────────┘           └────────────┘
                                     ▲
                                     │ imports
                             ┌───────┴────────┐
                             │ coach/ (core)  │
                             │ modelos + fase │
                             │ regras + yield │
                             │ parsers + prompts│
                             └────────────────┘
```

- `coach_de_cultivo_core/` — lib Python pura, sem I/O, 100% testável.
- `backend/` — Flask que importa `coach`, expõe REST, fala com Firestore/Gemini.
- `frontend/` — Next.js 14 App Router, client components, Tailwind.

---

## 3. Stack autoritativo

| Camada   | Tecnologia                            | Versão alvo      |
|----------|---------------------------------------|------------------|
| Core     | Python + dataclasses frozen + enums   | 3.12             |
| API      | Flask + Flask-CORS + Flask-JWT-Ext    | 3.x              |
| IA       | `google-generativeai`                 | 0.8.x            |
| DB       | Firebase Firestore                    | Admin SDK        |
| Storage  | Firebase Storage (GCS)                | Admin SDK        |
| Frontend | Next.js App Router + TS estrito       | 14.x             |
| Estilo   | Tailwind + shadcn/ui + Radix          | Tailwind 3.x     |
| Ícones   | lucide-react                          | 0.4+             |
| Lint     | Ruff + Black (py) / ESLint + Prettier | —                |
| Hosting  | Render Free + Vercel Hobby + Firebase | free-tier        |

Não subir versão sem pedir primeiro. Free-tier é requisito do projeto.

---

## 4. Regras de ouro para agentes

1. **Nunca desligue Firestore por SQLite.** Persistência é sempre Firebase.
2. **Nunca chame `genai` direto fora de `backend/app/services/gemini_provider.py`.**
   O provider é o único ponto de integração.
3. **Nunca escreva lógica de fase / PPM / alerta em `backend/` nem em `frontend/`.**
   Toda regra vive em `coach_de_cultivo_core/`. Backend e frontend apenas
   consomem.
4. **Nunca faça imports relativos quebrando ordem do app factory.** O Flask é
   criado via `create_app()`. Config vem de env. Sem side-effects em import.
5. **Nunca introduza dependência paga.** Se precisar de algo além de Gemini
   free-tier, pare e avise o dono.
6. **Nunca salve credenciais.** `.env.example` documenta chaves; `.env` real
   nunca entra no repo.
7. **Comentários em PT-BR.** Código, nomes de variável e docstrings em inglês.
   Mensagens de UI em PT-BR.
8. **Acessibilidade não é opcional:** `tabIndex={0}`, `aria-label`, role,
   `handleKeyDown` em tudo interativo — igual preferência do usuário.

---

## 5. Onde encontrar as coisas

- Modelos de domínio → `coach_de_cultivo_core/src/coach/models.py`
- Máquina de fases → `coach_de_cultivo_core/src/coach/phase_engine.py`
- Regras de irrigação → `coach_de_cultivo_core/src/coach/irrigation_rules.py`
- Estimador de yield → `coach_de_cultivo_core/src/coach/yield_estimator.py`
- Orquestrador → `coach_de_cultivo_core/src/coach/coach.py`
- Prompts de IA → `coach_de_cultivo_core/src/coach/prompts/`
- Parser de genética → `coach_de_cultivo_core/src/coach/strain_parser.py`
- Tests → `coach_de_cultivo_core/tests/`
- Rotas REST → `backend/app/blueprints/`
- Services (Firebase/Gemini/Strain) → `backend/app/services/`
- Páginas PWA → `frontend/app/`
- Componentes → `frontend/components/`
- Types TS compartilhados → `frontend/lib/types.ts`
- API client → `frontend/lib/api.ts`

Ao tocar em uma pasta, **leia o AGENTS.md daquela pasta antes**.

---

## 6. Comandos essenciais

### Core

```bash
cd coach_de_cultivo_core
pip install -e ".[dev]"
PYTHONPATH=src pytest -q
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # preencher chaves
python wsgi.py          # flask run equivalent
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
npm run build  # valida TS + produção
```

### Seed (opcional)

```bash
cd backend
PYTHONPATH=../coach_de_cultivo_core/src:. python scripts/seed_24k_gold.py
```

---

## 7. Checklist antes de abrir PR

- [ ] `pytest -q` no core passa (100%).
- [ ] `npm run build` no frontend passa (sem warning de TS).
- [ ] Sem `TODO`, `FIXME`, `console.log`, `print()` de debug no diff.
- [ ] `.env` não foi commitado.
- [ ] Se mudou contrato REST, `frontend/lib/api.ts` + `frontend/lib/types.ts`
      foram atualizados na mesma mudança.
- [ ] Se mudou modelo, testes foram atualizados / criados.
- [ ] README ou docs/ descrevem a mudança de comportamento (não de código).

---

## 8. Missões pré-escritas

A pasta `tasks/` contém missões numeradas que agentes podem executar de ponta
a ponta. São o jeito mais rápido de um agente novo contribuir.

Ver `ANTIGRAVITY_QUICKSTART.md` para o fluxo recomendado.
