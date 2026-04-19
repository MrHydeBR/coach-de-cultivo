# Agent context — backend Flask (`backend/`)

API REST em Flask que expõe o core `coach` para o PWA. Fala com Firestore,
Storage e Gemini. Deploy em **Render Free**.

---

## Estrutura

```
backend/
├── app/
│   ├── __init__.py          # create_app() factory + CORS + blueprints
│   ├── auth.py              # decorator X-API-Token
│   ├── config.py            # carrega env → Config dataclass
│   ├── blueprints/
│   │   ├── cycles_routes.py # /cycles (CRUD + setup + strain)
│   │   └── logs_routes.py   # /logs + /coach/today
│   ├── services/
│   │   ├── firebase_service.py # Firestore + Storage (singleton)
│   │   ├── gemini_provider.py  # vision + coach + grounding
│   │   ├── coach_service.py    # orquestra core + services
│   │   └── strain_service.py   # pesquisa + cache de genética
│   └── utils/
│       ├── serializers.py   # dataclass → dict
│       └── error_handlers.py# 400/401/404/500 → JSON
├── scripts/
│   └── seed_24k_gold.py     # popula ciclo de referência
├── requirements.txt
├── render.yaml              # deploy Render (single worker gunicorn)
├── Procfile                 # gunicorn wsgi:app
└── wsgi.py                  # entrypoint Render
```

---

## Regras desta pasta

1. **Factory pattern.** Só `create_app()` monta a app. Nada de globais
   executando em import.
2. **Services são singleton por processo.** `FirebaseService.init()`
   roda uma vez no startup; rotas fazem `FirebaseService.get()`.
3. **Gemini só pelo `gemini_provider.py`.** Se uma rota precisa de IA,
   ela injeta o provider via `current_app.config` ou via service. Nunca
   importa `google.generativeai` direto.
4. **Toda rota protegida** usa `@require_api_token`. Exceção: `/health`.
5. **Erros são JSON**, nunca HTML. Os handlers em `utils/error_handlers.py`
   garantem isso.
6. **Logs via `app.logger`**, nunca `print`.
7. **Sem SQLAlchemy / sem SQLite.** Persistência é Firestore.

---

## Endpoints (contrato)

| Método | Rota                                     | Propósito                     |
|--------|------------------------------------------|-------------------------------|
| GET    | `/health`                                | liveness (sem auth)           |
| GET    | `/cycles/active`                         | ciclo ativo (1 por usuário)   |
| POST   | `/cycles`                                | cria novo ciclo               |
| PATCH  | `/cycles/<id>/setup`                     | atualiza setup parcial        |
| GET    | `/cycles/<id>/strain-profile`            | retorna cache de genética     |
| POST   | `/cycles/<id>/strain-research`           | dispara pesquisa Gemini       |
| POST   | `/logs`                                  | cria log diário               |
| GET    | `/logs?cycle_id=X&limit=N`               | lista logs                    |
| GET    | `/coach/today?cycle_id=X`                | `CoachReport` do dia          |
| POST   | `/coach/vision`                          | diagnóstico de foto           |

Qualquer mudança aqui **obriga** atualização em `frontend/lib/api.ts` +
`frontend/lib/types.ts` no mesmo commit.

---

## Env vars (ver `.env.example`)

- `FLASK_ENV` — `development` | `production`
- `API_TOKEN` — segredo compartilhado com o frontend
- `FIREBASE_CREDENTIALS_JSON` — JSON inline OU
- `FIREBASE_CREDENTIALS_PATH` — caminho para `serviceAccount.json`
- `FIREBASE_STORAGE_BUCKET` — `<project>.appspot.com`
- `GEMINI_API_KEY` — chave do AI Studio
- `GEMINI_MODEL_TEXT` — default `gemini-2.0-flash-exp`
- `GEMINI_MODEL_VISION` — default `gemini-2.0-flash-exp`
- `CORS_ORIGINS` — CSV de origens permitidas

---

## Comandos

```bash
# Setup
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Rodar local
cp .env.example .env  # preencher
python wsgi.py        # ou: flask --app app run --debug

# Seed
PYTHONPATH=../coach_de_cultivo_core/src:. python scripts/seed_24k_gold.py

# Testes (subset)
pytest -q backend/
```

---

## Anti-patterns

- Global `app = Flask(__name__)` em `__init__.py`. Sempre factory.
- `firestore.client()` chamado direto em rota. Sempre via service.
- Misturar regra de negócio com serialização. Regra no `coach/`; rota
  só chama `CoachService.report_for_today(cycle_id)` e serializa.
- Usar `flask-restful` sem necessidade — blueprints + funções puras
  bastam para esse escopo.
