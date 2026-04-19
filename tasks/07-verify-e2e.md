# Mission 07 — Validação end-to-end

**Objetivo:** confirmar que o sistema completo funciona: foto sobe, Gemini
analisa, regras do core disparam alertas, UI mostra diagnóstico + ações.

**Tempo estimado:** 5 min + o tempo do seu próximo dia de rega.

---

## Cenários de teste

### Cenário A — Log sintético (sem foto real)

```bash
TOKEN=$API_TOKEN
BASE=https://coach-de-cultivo-api.onrender.com

curl -X POST -H "X-API-Token: $TOKEN" -H "Content-Type: application/json" \
  "$BASE/logs" -d '{
    "cycle_id": "24k_gold_fev26",
    "date": "2026-04-19",
    "ph_in": 6.0,
    "ec_in": 1.4,
    "volume_ml": 450,
    "runoff_ph": 5.2,
    "runoff_ec": 3.1,
    "notes": "teste e2e, runoff alto"
  }'
```

Deve retornar 201 com o log criado.

Depois:

```bash
curl -H "X-API-Token: $TOKEN" "$BASE/coach/today?cycle_id=24k_gold_fev26" | jq
```

Esperado no `CoachReport`:
- `alerts[]` contém pelo menos 1 alerta com `code = "RUNOFF_EC_HIGH"` ou similar
  (porque EC saída = 3.1 > target máximo).
- `recommendations[]` sugere flush ou redução de PPM.
- `phase` correto para semana atual.

### Cenário B — Dashboard web

1. Abrir PWA.
2. Dashboard mostra o alerta gerado pelo log sintético.
3. Ir em `/history` → ver o log no topo.
4. Ir em `/settings`:
   - Aba **Setup** → editar qualquer campo (ex.: watts para 70), salvar,
     voltar → persiste.
   - Aba **Genética** → clicar **Pesquisar genética com IA** → aguardar
     ~5s → card é populado com THC/CBD, terpenos, fontes externas.

### Cenário C — Vision real (foto de planta)

1. No PWA, ir em **Registrar → Nova rega**.
2. Preencher os campos de rega.
3. Anexar uma foto da planta.
4. Salvar.
5. Dashboard atualiza com diagnóstico visual:
   - Se a foto for saudável, sem alertas visuais.
   - Se mostrar algo (amarelado, queima de pontas), alerta correspondente.

### Cenário D — Spin-up do Render (chill check)

1. Deixar o backend parado ~20 min.
2. Atualizar o dashboard.
3. Primeira request deve demorar ~30s e depois voltar ao normal.
4. Se não voltar, checar logs do Render.

---

## Checklist final do projeto

- [ ] **Infra:** Firestore + Storage + Gemini + Render + Vercel todos up.
- [ ] **Auth:** token funciona; sem token retorna 401.
- [ ] **Log:** POST `/logs` grava no Firestore.
- [ ] **Coach:** `/coach/today` devolve alerta correto para cenário A.
- [ ] **Vision:** foto real gera diagnóstico.
- [ ] **Setup:** PATCH altera ciclo e persiste.
- [ ] **Genética:** pesquisa retorna perfil com 3+ fontes.
- [ ] **PWA:** instala no celular e funciona offline (cache do Next.js).
- [ ] **Custo:** `$0.00/mês` confirmado nos dashboards free-tier.

---

## Próximos features (ordem de ROI)

1. **Push notifications** — avisar quando runoff estiver fora da faixa.
2. **Export CSV** — histórico para analise fora do app.
3. **Comparar ciclos** — dashboard side-by-side.
4. **Timer automático de lights** via integração Home Assistant.
5. **Multi-ciclo** — hoje é 1 ciclo ativo; permitir N paralelos.

Mover para `docs/roadmap.md` à medida que priorizar.

---

🎉 **Fim da implantação.** Daqui em diante é evolução contínua. Use o
Antigravity como co-piloto para cada feature nova — ele já sabe as
convenções (ver `AGENTS.md`).
