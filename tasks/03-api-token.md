# Mission 03 — Gerar token compartilhado front ↔ back

**Objetivo:** o PWA autentica no backend via header `X-API-Token`. Só os
dois precisam saber o segredo.

**Tempo estimado:** 2 min.

---

## Passo a passo

### 1. Gerar um token forte

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Saída exemplo: `x1Qe5KXq7mKlN9zR...`. Copiar.

### 2. Plugar no backend `.env`

```
API_TOKEN=<valor_copiado>
CORS_ORIGINS=http://localhost:3000,https://<seu-app>.vercel.app
```

### 3. Plugar no frontend `.env.local`

Criar `frontend/.env.local` (já no `.gitignore`):

```
NEXT_PUBLIC_API_TOKEN=<MESMO_valor>
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

> **Atenção:** `NEXT_PUBLIC_*` fica exposto no bundle. Isso é OK aqui
> porque é uso pessoal (single-user). Se for multi-usuário no futuro,
> trocar por Firebase Auth + ID token.

### 4. Validar

```bash
# terminal 1: backend
cd backend && source .venv/bin/activate && python wsgi.py

# terminal 2: teste
curl -i http://localhost:5000/health
# → 200 OK (rota sem auth)

curl -i http://localhost:5000/cycles/active
# → 401 Unauthorized

curl -i -H "X-API-Token: <valor>" http://localhost:5000/cycles/active
# → 200 OK ou 404 (sem ciclo ainda)
```

---

## Checklist

- [ ] Token gerado com `secrets.token_urlsafe(32)`.
- [ ] `backend/.env` tem `API_TOKEN`.
- [ ] `frontend/.env.local` tem `NEXT_PUBLIC_API_TOKEN` idêntico.
- [ ] `curl` sem header retorna 401; com header retorna 200/404.

**Próxima missão:** [04-deploy-render.md](./04-deploy-render.md)
