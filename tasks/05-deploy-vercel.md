# Mission 05 — Deploy do PWA no Vercel

**Objetivo:** frontend Next.js rodando em `https://coach-de-cultivo.vercel.app`,
instalável no celular como PWA.

**Tempo estimado:** 10 min.

---

## Pré-requisitos

- Missão 04 concluída (URL do backend em `*.onrender.com`).
- Repo no GitHub (mesmo da missão 04).

---

## Passo a passo

### 1. Importar o projeto no Vercel

1. Abrir https://vercel.com/new
2. **Import Git Repository** → selecionar `coach-de-cultivo`
3. Configurar:
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `frontend`
   - **Build Command:** default (`npm run build`)
   - **Output Directory:** default (`.next`)

### 2. Variáveis de ambiente

Em **Environment Variables**, adicionar (todas scope = Production + Preview):

| Key                     | Value                                                  |
|-------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_API_BASE`  | `https://coach-de-cultivo-api.onrender.com`            |
| `NEXT_PUBLIC_API_TOKEN` | (mesmo token da missão 03)                             |

> Lembrete: `NEXT_PUBLIC_*` vai para o bundle do cliente. Para uso
> single-user é aceitável.

### 3. Deploy

Clicar **Deploy**. Build leva ~2 min.

Quando ficar verde, abrir a URL e:

1. Confirmar que a página `/` carrega (pode dar erro "Nenhum ciclo" — OK).
2. Abrir DevTools → Network → tentar chamar `/cycles/active` via UI.
3. Resposta deve vir do backend Render com 200 ou 404.

### 4. CORS

Se der erro CORS no console do browser:

1. Voltar ao Render → env var `CORS_ORIGINS`.
2. Adicionar a URL do Vercel separada por vírgula:
   ```
   https://coach-de-cultivo.vercel.app,http://localhost:3000
   ```
3. Render → **Manual Deploy → Clear build cache & deploy**.

### 5. PWA install

1. Abrir a URL no Chrome mobile.
2. Menu `⋮` → **Instalar aplicativo / Adicionar à tela inicial**.
3. Ícone aparece com manifesto de `frontend/public/manifest.json`.

### 6. Domínio custom (opcional)

Vercel → Settings → Domains → adicionar. Grátis se você já tem um
domínio. Sem domínio próprio, `*.vercel.app` funciona perfeitamente.

---

## Checklist

- [ ] Projeto Vercel importado do repo.
- [ ] Root directory = `frontend`.
- [ ] `NEXT_PUBLIC_API_BASE` aponta para Render.
- [ ] `NEXT_PUBLIC_API_TOKEN` é o mesmo da missão 03.
- [ ] Build completou sem erro de TS.
- [ ] CORS configurado no Render.
- [ ] App abre em `*.vercel.app`.
- [ ] Instalável no celular.

**Próxima missão:** [06-seed-data.md](./06-seed-data.md)
