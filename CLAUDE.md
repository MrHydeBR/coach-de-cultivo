# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

PWA pessoal de coach de cultivo indoor de cannabis medicinal. Mauro envia rega + foto via mobile e o sistema devolve diagnóstico visual (Gemini), alertas determinísticos, ações para 24h e 3–5 dias. Toda infraestrutura é **free-tier** (Render Free + Vercel Hobby + Firebase Spark + Gemini AI Studio). Custo-alvo ≤ R$ 0/mês.

## Comandos essenciais

### Core (lib Python pura)
```bash
cd coach_de_cultivo_core
pip install -e ".[dev]"
PYTHONPATH=src pytest -q                    # todos os testes
PYTHONPATH=src pytest tests/test_foo.py -q  # teste único
```

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # preencher chaves
python wsgi.py         # dev em :8080
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev    # dev em :3000
npm run build  # valida TS + gera produção
```

### Seed (opcional)
```bash
cd backend
PYTHONPATH=../coach_de_cultivo_core/src:. python scripts/seed_24k_gold.py
```

## Arquitetura

```
frontend/ (Next.js 14, Vercel)
    app/layout.tsx              ← layout global com navbar Início/Histórico
    app/page.tsx                ← dashboard: ciclo ativo + botão rega
    app/history/page.tsx        ← histórico de logs com cores pH/EC
    components/LogForm.tsx      ← modal de registro de rega + foto + diagnóstico
    lib/api.ts                  ← único ponto de fetch; nunca usar fetch direto em componentes
    lib/types.ts                ← contrato REST; manter em sync com o backend
    public/manifest.json        ← PWA manifest

backend/ (Flask, Render)
    wsgi.py                         ← entrypoint gunicorn
    app/__init__.py                 ← create_app(): inicializa FirebaseService + GeminiProvider, registra blueprint
    app/config.py                   ← Config.from_env(); sem side-effects em import
    app/auth.py                     ← decorator @require_api_token (X-API-Token header)
    app/blueprints/cycles_routes.py ← todas as rotas /cycles/*
    app/services/firebase_service.py  ← singleton Firestore; init() chamado em create_app()
    app/services/gemini_provider.py   ← singleton Gemini; init() chamado em create_app()

coach_de_cultivo_core/ (lib Python, sem I/O)
    src/coach/rules.py              ← check_log(log, setup) → list[Alert]; regras pH/EC
    src/coach/prompts/vision_prompt.py  ← build_vision_prompt(log, cycle) → str
    src/coach/prompts/strain_prompt.py  ← build_strain_research_prompt(...)
```

**Regra crítica de camadas:** toda lógica de fase, PPM, alerta e yield vive em `coach_de_cultivo_core/`. Backend e frontend apenas consomem — nunca reimplementam.

## Variáveis de ambiente (backend)

| Var | Descrição |
|-----|-----------|
| `API_TOKEN` | Token fixo; frontend envia em `X-API-Token` |
| `GEMINI_API_KEY` | Chave Gemini AI Studio |
| `GEMINI_MODEL_TEXT` / `GEMINI_MODEL_VISION` | `gemini-2.5-flash` (único modelo free-tier disponível para esta chave) |
| `FIREBASE_CREDENTIALS_JSON` | JSON do service account em uma linha (produção) |
| `FIREBASE_CREDENTIALS_PATH` | Caminho para o JSON (dev local) |
| `FIREBASE_STORAGE_BUCKET` | `coach-de-cultivo.appspot.com` |
| `CORS_ORIGINS` | Origens permitidas separadas por vírgula |

## Variáveis de ambiente (frontend)

| Var | Descrição |
|-----|-----------|
| `NEXT_PUBLIC_API_BASE` | URL do backend (`https://coach-de-cultivo.onrender.com`) |
| `NEXT_PUBLIC_API_TOKEN` | Mesmo token de `API_TOKEN` |

> `NEXT_PUBLIC_*` vai para o bundle do cliente — aceitável para uso single-user.

## Regras inegociáveis

1. Persistência sempre via **Firebase** — nunca SQLite ou outro banco.
2. `genai` só pode ser chamado dentro de `backend/app/services/gemini_provider.py`.
3. Lógica de domínio (fase, PPM, alerta, yield) só em `coach_de_cultivo_core/`.
4. `create_app()` é o único entrypoint Flask; config vem de env; sem side-effects em import.
5. Nenhuma dependência paga — parar e avisar se precisar de algo além do free-tier.
6. UI: `tabIndex={0}`, `aria-label` e `onKeyDown` em todo elemento interativo.
7. Comentários em PT-BR; código, variáveis e docstrings em inglês.

## Armadilhas conhecidas

### Credenciais Firebase
`FIREBASE_CREDENTIALS_PATH` é um **caminho de arquivo** (dev local: `./serviceAccount.json`).  
`FIREBASE_CREDENTIALS_JSON` é o **conteúdo JSON em string** (produção/Render).  
Nunca colocar JSON no valor de `FIREBASE_CREDENTIALS_PATH` — o código tenta abrir o valor como arquivo e lança `FileNotFoundError`.

### Modelo Gemini
`gemini-2.5-flash` é o único modelo com free-tier ativo para esta chave de API. `gemini-2.0-flash` e `gemini-1.5-flash` retornam quota 0 ou 404. Antes de trocar o modelo, verificar disponibilidade com `ListModels`.

### Python local vs Render
O `.venv` local do backend usa Python 3.9 (Mac mini). O Render roda Python 3.12 (forçado por `PYTHON_VERSION=3.12.0` em env vars + `runtime.txt` com `3.12`). Não instalar pacotes que exijam ≥ 3.10 sem verificar compatibilidade local. Warnings do IDE sobre módulos não encontrados são do Python 3.9 sem venv — ignorar.

### Firestore — coleções
- `cycles/{cycle_id}` — documento do ciclo (`status: "active"` marca o ciclo atual)
- `cycles/{cycle_id}/logs/D{NN}` — logs de rega (D01…D70+); ID calculado por `(log_date - start_date).days + 1`
- `coach_report.visual_summary/issues/positives` são gravados no log após análise Gemini vision

### coach_de_cultivo_core no Render
O core é instalado via `requirements.txt` com path relativo: `../coach_de_cultivo_core`. Funciona porque o Render clona o repo inteiro antes de instalar as dependências a partir do `backend/`. Nunca remover essa linha do `requirements.txt`.

### Render Free — cold start
O serviço dorme após ~15 min de inatividade. O primeiro request após dormir demora ~30s. "Failed to fetch" no frontend geralmente é cold start — basta recarregar.

## Contrato REST atual

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/health` | não | health check |
| GET | `/cycles/active` | sim | ciclo com `status=active` |
| GET | `/cycles/<id>/logs` | sim | lista todos os logs ordenados por dia desc |
| POST | `/cycles/logs` | sim | grava log de rega; retorna doc com `doc_id` |
| GET | `/cycles/coach/today?cycle_id=` | sim | alertas determinísticos do último log |
| POST | `/cycles/coach/vision` | sim | analisa foto base64 com Gemini; grava visual_summary no log |

## Deploy

- **Backend:** Render Free → root dir `backend`, start `gunicorn wsgi:app`, Python 3.12 (`PYTHON_VERSION=3.12.0` em env vars).
- **Frontend:** Vercel Hobby → root dir `frontend`, Framework Next.js.
- **Dependências Python:** sempre pinnar versões exatas em `requirements.txt`.
