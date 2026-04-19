# Agent context — core lib (`coach_de_cultivo_core/`)

Esta pasta é o **cérebro do projeto**. Biblioteca Python pura, sem I/O,
sem rede, sem Firebase, sem Flask. Só lógica de domínio e testes.

---

## O que vive aqui

| Módulo                          | Responsabilidade                                  |
|---------------------------------|---------------------------------------------------|
| `models.py`                     | Dataclasses frozen + enums (Phase, Alert, etc)    |
| `phase_engine.py`               | Mapeia dias desde flip → fase + semana            |
| `irrigation_rules.py`           | PPM/pH/runoff → alertas determinísticos           |
| `yield_estimator.py`            | Estima yield por fase × ambiente × genética       |
| `coach.py`                      | Orquestrador: combina tudo em `CoachReport`       |
| `strain_parser.py`              | Parser defensivo de resposta Gemini (JSON)        |
| `prompts/coach_prompt.py`       | Prompt PT-BR para análise diária                  |
| `prompts/vision_prompt.py`      | Prompt PT-BR para diagnóstico de foto             |
| `prompts/strain_prompt.py`      | Prompt PT-BR para pesquisa de genética            |

---

## Regras desta pasta

1. **Zero I/O.** Nada de `open()`, `requests`, `firebase_admin`, `genai`.
   Este módulo recebe dados prontos e devolve dataclasses.
2. **Tudo frozen.** Dataclasses são `frozen=True`. Estado é imutável.
3. **Datas são `date` ou `datetime` com timezone.** Nunca string.
4. **Enums em vez de literais.** Se tem 3+ valores possíveis, vira Enum.
5. **Parser nunca levanta.** `strain_parser.parse_strain_profile` é
   defensivo: retorna `StrainProfile` mesmo com JSON quebrado.
6. **Docstrings PT-BR no que o usuário final lê; inglês nos internos.**

---

## Adicionar uma nova regra

1. Definir o enum de alerta em `models.py` se for novo tipo.
2. Implementar função pura em `irrigation_rules.py` com assinatura
   `def check_X(state: DailyLog, target: SetupTarget) -> list[Alert]`.
3. Chamar do orquestrador em `coach.py`.
4. Adicionar fixture correspondente em `tests/fixtures/` + teste em
   `tests/test_irrigation_rules.py`.
5. Rodar `PYTHONPATH=src pytest -q` — tem que passar 100%.

---

## Comandos

```bash
# Setup
pip install -e ".[dev]"

# Testes
PYTHONPATH=src pytest -q

# Coverage
PYTHONPATH=src pytest --cov=coach --cov-report=term-missing

# Exemplo CLI
PYTHONPATH=src python examples/analyze_today.py
```

---

## Anti-patterns (agente NÃO faz)

- Importar `flask`, `firebase_admin` ou `google.generativeai` aqui dentro.
- Mutar uma dataclass com `object.__setattr__` — reconstrói nova instância.
- Retornar `dict` em vez de dataclass do domínio.
- Tratar "null" / "None" em strings — normalize para `None` no parser.
- Usar `assert` fora de testes.
