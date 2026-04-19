# Mission 02 — Configurar Gemini 2.0 Flash

**Objetivo:** ter API key do Gemini funcionando com vision + coach + grounding.

**Tempo estimado:** 5 min.

---

## Passo a passo

### 1. Obter a chave no Google AI Studio

1. Abrir https://aistudio.google.com/apikey
2. Fazer login com a **mesma conta Google** do Firebase (facilita quota).
3. **Create API key** → escolher "Create API key in existing project" e
   apontar para o projeto `coach-de-cultivo`.
4. Copiar a chave (formato `AIzaSy...`).

### 2. Plugar no `.env`

Editar `backend/.env`:

```
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL_TEXT=gemini-2.0-flash-exp
GEMINI_MODEL_VISION=gemini-2.0-flash-exp
```

### 3. Smoke test de texto

```bash
cd backend
source .venv/bin/activate
python - <<'PY'
from app.config import Config
from app.services.gemini_provider import GeminiProvider
gp = GeminiProvider(api_key=Config.from_env().gemini_api_key, model_text="gemini-2.0-flash-exp", model_vision="gemini-2.0-flash-exp")
result = gp.generate_coach("Diga 'coach ok' em 3 palavras.")
print(result.text)
PY
```

Deve imprimir algo como `coach ok funcionando`. Se der erro 403 ou
`API key not valid`, revisar passo 1.

### 4. Smoke test de vision (opcional mas recomendado)

Baixar uma foto de planta e:

```bash
python - <<'PY'
from pathlib import Path
from app.config import Config
from app.services.gemini_provider import GeminiProvider
gp = GeminiProvider(api_key=Config.from_env().gemini_api_key, model_text="gemini-2.0-flash-exp", model_vision="gemini-2.0-flash-exp")
img = Path("plant.jpg").read_bytes()
out = gp.analyze_photo(img, prompt="Descreva em uma frase.")
print(out.text)
PY
```

### 5. Smoke test de grounding (pesquisa de genética)

```bash
python - <<'PY'
from app.config import Config
from app.services.gemini_provider import GeminiProvider
from coach.prompts import build_strain_research_prompt
gp = GeminiProvider(api_key=Config.from_env().gemini_api_key, model_text="gemini-2.0-flash-exp", model_vision="gemini-2.0-flash-exp")
prompt = build_strain_research_prompt("Kosher Kush x Tangie", "")
out = gp.research_strain(prompt)
print("chars:", len(out.text))
print("sources:", len(out.sources))
PY
```

Espera-se ~2–4 KB de texto JSON e 3–8 fontes.

---

## Custos esperados (free-tier AI Studio)

| Uso                          | Tokens     | Nível gratuito / dia |
|------------------------------|------------|----------------------|
| 1 análise diária (texto)     | ~2k in + 1k out | 15 req/min, 1500/dia |
| 1 análise vision             | ~3k in + 1k out |                      |
| 1 pesquisa strain (grounded) | ~2k in + 2k out |                      |

Para o uso pessoal (1 ciclo, 1–2 regas/semana), free-tier sobra.

---

## Checklist

- [ ] Chave criada.
- [ ] `.env` atualizado.
- [ ] Smoke test de texto passou.
- [ ] (Opcional) Vision e grounding testados.

**Próxima missão:** [03-api-token.md](./03-api-token.md)
