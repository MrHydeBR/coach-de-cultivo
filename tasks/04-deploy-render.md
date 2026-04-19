# Mission 04 — Deploy do backend no Render

**Objetivo:** Flask API rodando 24/7 em `https://coach-de-cultivo.onrender.com`
no plano **Free** (spin-down após 15 min idle, spin-up em ~30 s).

**Tempo estimado:** 15 min (principalmente esperando o build).

---

## Pré-requisitos

- Código já em um repositório Git (GitHub / GitLab).
- Missões 01, 02, 03 concluídas (Firebase + Gemini + token).

---

## Passo a passo

### 1. Subir para GitHub

```bash
cd "Coach de cultivo"
git init
git add .
git commit -m "Initial: Coach de Cultivo v1.1"
gh repo create coach-de-cultivo --private --source=. --push
```

Ou pelo UI do GitHub → criar repo privado → `git remote add origin ...`
→ `git push -u origin main`.

**Confirmar** que `backend/.env` e `backend/serviceAccount.json` NÃO estão
no repo (`git log --all --full-history -- backend/serviceAccount.json`
deve ser vazio).

### 2. Criar web service no Render

1. Abrir https://dashboard.render.com
2. **New → Web Service**
3. Conectar GitHub → selecionar `coach-de-cultivo`
4. Configurar:
   - **Name:** `coach-de-cultivo-api`
   - **Region:** Oregon (free) ou São Paulo (se disponível)
   - **Branch:** `main`
   - **Root directory:** `backend`
   - **Runtime:** Python 3
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn wsgi:app`
   - **Plan:** Free

### 3. Variáveis de ambiente

Em **Environment → Environment Variables**, adicionar:

| Key                          | Value                                          |
|------------------------------|------------------------------------------------|
| `FLASK_ENV`                  | `production`                                   |
| `API_TOKEN`                  | (mesmo da missão 03)                           |
| `GEMINI_API_KEY`             | (da missão 02)                                 |
| `GEMINI_MODEL_TEXT`          | `gemini-2.0-flash-exp`                         |
| `GEMINI_MODEL_VISION`        | `gemini-2.0-flash-exp`                         |
| `FIREBASE_STORAGE_BUCKET`    | `coach-de-cultivo.appspot.com`                 |
| `FIREBASE_CREDENTIALS_JSON`  | (ver passo 4)                                  |
| `CORS_ORIGINS`               | `https://<seu-app>.vercel.app,http://localhost:3000` |
| `PYTHONPATH`                 | `../coach_de_cultivo_core/src`                 |

### 4. Credencial Firebase como env var

O `serviceAccount.json` não pode ir no repo. Para mandar para o Render:

```bash
cat backend/serviceAccount.json | tr -d '\n'
```

Copiar a saída (uma linha) e colar em `FIREBASE_CREDENTIALS_JSON`.

O `firebase_service.py` já sabe preferir `FIREBASE_CREDENTIALS_JSON`
sobre `FIREBASE_CREDENTIALS_PATH`.

### 5. Subir

Render faz deploy automático após salvar. Acompanhar em **Events**.

Build leva ~3–5 min. Quando ficar **Live**, testar:

```bash
curl https://coach-de-cultivo-api.onrender.com/health
# → {"status":"ok"}

curl -H "X-API-Token: $API_TOKEN" https://coach-de-cultivo-api.onrender.com/cycles/active
# → 404 ou 200 com ciclo
```

### 6. Spin-down (comportamento do plano free)

Render Free derruba o serviço após 15 min sem tráfego. Primeira chamada
do dia demora ~30 s para acordar. Para uso pessoal é aceitável; se
incomodar, o plano **Starter ($7/mês)** mantém sempre up.

Alternativa grátis: cron job externo (UptimeRobot) fazendo ping a cada
10 min no `/health`. Gastos: 0. Desvantagem: consome minutos do free-tier.

---

## Checklist

- [ ] Repo privado no GitHub com o código.
- [ ] Web service criado no Render apontando para `backend/`.
- [ ] Todas as env vars preenchidas.
- [ ] `FIREBASE_CREDENTIALS_JSON` em uma linha.
- [ ] `/health` responde 200 em produção.
- [ ] Rota autenticada responde com o token.

**Próxima missão:** [05-deploy-vercel.md](./05-deploy-vercel.md)
