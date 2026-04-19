# Mission 06 — Seed do ciclo "24K Gold Fev26"

**Objetivo:** popular Firestore com o ciclo de referência + logs históricos
do D1 ao D38, para que o dashboard tenha dados reais no primeiro acesso.

**Tempo estimado:** 3 min.

---

## Passo a passo

### 1. Setup local do seed

```bash
cd backend
source .venv/bin/activate
export PYTHONPATH=../coach_de_cultivo_core/src:.
```

### 2. Revisar o seed antes de rodar

Abrir `backend/scripts/seed_24k_gold.py`. Campos principais:

```python
cycle = {
  "cycle_id": "24k_gold_fev26",
  "strain": "24K Gold (Kosher Kush x Tangie)",
  "start_date": "2026-02-10",
  "flip_date": "2026-03-13",
  "setup": {
    "tent_height_cm": 75,
    "tent_width_cm": 50,
    "tent_depth_cm": 40,
    "light_watts": 65,
    "photoperiod_on_hours": 12,
    "substrate": "coco",
    "pot": "7L fabric",
    "nutrient_line": "EasyCoco A+B+C",
    "runoff_target_min": 1.8,
    "runoff_target_max": 2.2,
  },
  ...
}
```

Se seu setup mudou desde o doc inicial, ajuste os campos aqui **antes**
de rodar. O script é idempotente — rodar de novo atualiza os valores.

### 3. Executar

```bash
python scripts/seed_24k_gold.py
```

Saída esperada:

```
[seed] Firebase OK (project=coach-de-cultivo)
[seed] Cycle upserted: 24k_gold_fev26
[seed] Logs: 38/38 (D1..D38)
[seed] Done in 4.2s
```

### 4. Validar no Firebase Console

1. Firebase Console → Firestore.
2. Conferir coleções:
   - `cycles/24k_gold_fev26` (doc principal)
   - `cycles/24k_gold_fev26/logs/` (38 docs de D1 a D38)
3. Spot-check um log qualquer — deve ter campos `ph_in`, `ec_in`,
   `volume_ml`, `runoff_ph`, `runoff_ec`, `coach_report`.

### 5. Validar na API

```bash
curl -s -H "X-API-Token: $API_TOKEN" \
  https://coach-de-cultivo-api.onrender.com/cycles/active | jq '.cycle_id'
# → "24k_gold_fev26"

curl -s -H "X-API-Token: $API_TOKEN" \
  "https://coach-de-cultivo-api.onrender.com/logs?cycle_id=24k_gold_fev26&limit=5" | jq 'length'
# → 5
```

### 6. Validar na UI

Abrir `https://coach-de-cultivo.vercel.app`.

Dashboard deve mostrar:
- Badge "Flora — semana N" (N = semana atual desde flip)
- Alerta ou "Planta tranquila"
- Timeline com 38 entries em `/history`

---

## Checklist

- [ ] Seed rodou sem erro.
- [ ] Firestore tem `cycles/24k_gold_fev26` + 38 logs.
- [ ] API devolve o ciclo como ativo.
- [ ] UI renderiza o dashboard com dados reais.

**Próxima missão:** [07-verify-e2e.md](./07-verify-e2e.md)
