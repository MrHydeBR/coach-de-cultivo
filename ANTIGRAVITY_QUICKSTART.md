# Quickstart — Coach de Cultivo no Google Antigravity IDE

Este guia coloca você rodando o Coach de Cultivo em ~30 minutos, usando o
Antigravity IDE (ou Cursor / Windsurf / qualquer IDE agente que leia
`AGENTS.md`) para automatizar a configuração.

---

## 0. Pré-requisitos na sua máquina

| Ferramenta | Versão mínima | Como checar                 |
|------------|---------------|-----------------------------|
| Python     | 3.12          | `python3 --version`         |
| Node.js    | 18.18+        | `node -v`                   |
| pnpm ou npm| qualquer      | `npm -v`                    |
| Git        | qualquer      | `git --version`             |
| Conta      | Google        | para Firebase + AI Studio   |

E o **Google Antigravity IDE** instalado (ou Cursor/Windsurf como alternativa).

---

## 1. Abrir o workspace

1. Abra o Antigravity IDE.
2. **File → Open Folder** → selecione a pasta `Coach de cultivo/` inteira.
   (Não abra `backend/` ou `frontend/` isoladamente — o agente precisa
   do `AGENTS.md` raiz para contexto cruzado.)
3. O IDE vai detectar os `AGENTS.md` automaticamente. Você verá um badge
   indicando "Agent rules loaded" na barra de status.

---

## 2. Sessão inicial com o agente

Abra o painel de agente (Antigravity: `⌘J` / Cursor: `⌘L`) e cole:

```
Leia o AGENTS.md raiz, depois leia o tasks/01-firebase.md e execute a missão.
Pare antes de qualquer comando destrutivo e me mostre o diff.
```

O agente vai:

1. Criar projeto no Firebase console (ou te guiar pelos cliques).
2. Gerar `serviceAccount.json` e colocar em `backend/`.
3. Popular `backend/.env` a partir de `.env.example`.
4. Rodar `pytest` no core para validar.

Repita com as tasks 02, 03, 04, 05 — ou peça "execute as tasks de 01 a 05
em sequência, parando entre cada uma para eu aprovar".

---

## 3. Fluxo recomendado (ordem das missões)

| # | Task                       | Saída                                    |
|---|----------------------------|------------------------------------------|
| 1 | `01-firebase.md`           | Firestore + Storage provisionados        |
| 2 | `02-gemini.md`             | API key Gemini + teste de vision         |
| 3 | `03-api-token.md`          | Token secreto entre front ↔ back         |
| 4 | `04-deploy-render.md`      | Flask online em `*.onrender.com`         |
| 5 | `05-deploy-vercel.md`      | PWA online em `*.vercel.app`             |
| 6 | `06-seed-data.md`          | Ciclo `24K Gold Fev26` populado          |
| 7 | `07-verify-e2e.md`         | Log real do dia + diagnóstico funcionando|

Depois de 07 passar, você tem o app em produção.

---

## 4. Convenções do projeto que o agente vai respeitar

Elas estão detalhadas no `AGENTS.md` raiz, mas em uma linha:

- Toda regra de cultivo vive em `coach_de_cultivo_core/`. Nunca no backend
  ou frontend.
- Persistência é **sempre** Firestore. Nunca SQLite.
- Chamadas a Gemini passam **apenas** pelo `gemini_provider.py`.
- Tailwind puro no frontend (sem CSS solto), shadcn/ui para primitivos,
  Radix para acessibilidade.
- Strings de UI em PT-BR; código e variáveis em inglês.

---

## 5. Comandos rápidos no agente

Dentro do chat do Antigravity, frases que funcionam bem:

- "Rode os testes do core e me mostre só o resumo."
- "Adicione um endpoint REST para atualizar o estágio da fase manualmente.
  Atualize o type em `frontend/lib/types.ts` e o client em
  `frontend/lib/api.ts` no mesmo commit."
- "Refatore `coach.py` para aceitar múltiplas plantas no mesmo ciclo,
  sem quebrar os testes existentes."
- "Gere uma migração Firestore que renomeia o campo `tent_volume_l` para
  `canopy_volume_l` em todos os ciclos."

Sempre peça **diff antes de aplicar** em mudanças estruturais. O IDE
suporta isso nativamente.

---

## 6. Debug comum

| Sintoma                                  | Causa                                  | Onde olhar                        |
|------------------------------------------|----------------------------------------|-----------------------------------|
| `401 Unauthorized` no PWA                | Token do front ≠ token do back         | Vercel env `NEXT_PUBLIC_API_TOKEN`|
| `503` no `/coach/today`                  | Gemini sem quota ou chave inválida     | `backend/.env` → `GEMINI_API_KEY` |
| Build Vercel falha em `types.ts`         | Contrato REST mudou sem atualizar type | `frontend/lib/types.ts`           |
| `pytest` falha em `test_phase_engine`    | Regra de fase editada sem atualizar fix| `tests/fixtures/cycle_24k_gold.py`|
| Foto não sobe                            | Regra de Storage restritiva demais     | Firebase Console → Storage → Rules|

---

## 7. Próximos passos depois da primeira subida

Leia `docs/next-features.md` (gerado quando você concluir a missão 07)
para ideias ordenadas por ROI: export CSV, compare-cycles, auto-lights,
notificações push, etc.

---

Dúvidas sobre convenções? Pergunte ao agente: **"Explique a regra de X
citando o AGENTS.md pertinente."** Ele vai buscar o arquivo e citar a
seção.
