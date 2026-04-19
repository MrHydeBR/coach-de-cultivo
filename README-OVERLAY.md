# Coach de Cultivo — Antigravity Overlay

Este zip contém **apenas a camada de metadata do Antigravity IDE** — os
arquivos que transformam o projeto existente em um workspace agente-ready.

## Por que só a overlay?

O código-fonte do Coach de Cultivo (backend Flask, frontend Next.js,
core Python) já está na pasta do projeto na sua máquina. Empacotar só a
overlay evita duplicação e mantém o zip pequeno (~100 KB vs ~5 MB se
incluísse tudo).

## O que tem aqui

```
AGENTS.md                           ← contrato global para agentes
ANTIGRAVITY_QUICKSTART.md           ← fluxo de 30min para subir tudo
coach_de_cultivo_core/AGENTS.md     ← regras da lib pura
backend/AGENTS.md                   ← regras do Flask
frontend/AGENTS.md                  ← regras do Next.js
docs/
  architecture.md                   ← visão arquitetural completa
  conventions.md                    ← convenções Python + TS
tasks/
  README.md                         ← índice das missões
  01-firebase.md                    ← provisionar Firestore + Storage
  02-gemini.md                      ← API key do Gemini 2.0
  03-api-token.md                   ← token compartilhado front↔back
  04-deploy-render.md               ← deploy Flask no Render Free
  05-deploy-vercel.md               ← deploy PWA no Vercel Hobby
  06-seed-data.md                   ← seed do ciclo 24K Gold Fev26
  07-verify-e2e.md                  ← validação end-to-end
```

## Como usar

### Opção 1 — Sobrepor no projeto existente (recomendado)

```bash
cd "Coach de cultivo"        # sua pasta de projeto
unzip -o ../coach-de-cultivo-antigravity-overlay.zip
```

`-o` = overwrite. Como os AGENTS.md vão para pastas diferentes e nenhum
arquivo-fonte é tocado, é seguro.

Depois, abra a pasta `Coach de cultivo/` no Google Antigravity IDE.
Ele lê os AGENTS.md automaticamente.

### Opção 2 — Gerar o pacote final unindo overlay + código

Se quiser UM zip único contendo overlay + todo o código-fonte (para
levar para outra máquina, commit Git, etc.):

```bash
# 1) sobreponha a overlay
cd "Coach de cultivo"
unzip -o ../coach-de-cultivo-antigravity-overlay.zip

# 2) gere o zip consolidado
cd ..
zip -r coach-de-cultivo-full.zip "Coach de cultivo" \
  -x "Coach de cultivo/**/node_modules/*" \
     "Coach de cultivo/**/.next/*" \
     "Coach de cultivo/**/__pycache__/*" \
     "Coach de cultivo/**/.venv/*" \
     "Coach de cultivo/**/.pytest_cache/*" \
     "Coach de cultivo/**/serviceAccount.json" \
     "Coach de cultivo/**/.env" \
     "Coach de cultivo/**/.env.local" \
     "Coach de cultivo/**/.DS_Store"
```

Resultado: `coach-de-cultivo-full.zip` com tudo.

## Próximo passo

Leia `ANTIGRAVITY_QUICKSTART.md` e rode as missões `tasks/01` a `tasks/07`
pelo agente do IDE. Tempo total: ~50 min até o app em produção.
