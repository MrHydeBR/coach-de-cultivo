# Convenções de código — Coach de Cultivo

Resumo executável das preferências do dono + padrões do projeto. Esta é
a referência que agentes de IDE consultam quando estão em dúvida.

---

## Python (core + backend)

### Estilo
- Python 3.12.
- Black + Ruff (configurados nos `pyproject.toml` respectivos).
- Type hints em 100% das funções e métodos públicos.
- `from __future__ import annotations` no topo quando ajudar circulares.

### Dataclasses
- `@dataclass(frozen=True, slots=True)` sempre que possível.
- Nunca mutar com `object.__setattr__`; construir nova instância.
- Métodos derivados vão em propriedades `@property`.

### Enums
- Qualquer domínio com 3+ valores vira `Enum`.
- Nome do enum: singular, PascalCase (`Phase`, `AlertLevel`).
- Valores em `snake_case` quando for string; ou `auto()` quando for arbitrário.

### Erros
- Funções puras do core **nunca retornam None em caso de erro**: ou
  devolvem um tipo válido (com flag), ou levantam exceção custom.
- Parsers (ex.: `strain_parser`) são defensivos: **nunca levantam**.
- Backend usa guard clauses + early return:

  ```python
  def update_setup(cycle_id: str, patch: dict) -> dict:
      if not patch:
          abort(400, "empty patch")
      cycle = fb.get_cycle(cycle_id)
      if cycle is None:
          abort(404, "cycle not found")
      # happy path ...
  ```

### Imports
- Absolutos sempre. Nada de `from ..models import X`.
- Agrupar: stdlib → third-party → primeiro party (`coach.*`, `app.*`).

### Logs
- `app.logger.info("message", extra={"key": value})` no backend.
- Nunca `print()` em código que não seja exemplo/teste.

---

## TypeScript (frontend)

### Estilo
- TS estrito (`tsconfig.json` → `strict: true`).
- ESLint + Prettier.
- Zero `any`. Se um tipo externo é desconhecido, usar `unknown` + narrow.

### Componentes
- Funcionais com hooks. Sem classes.
- Arquivo = 1 componente (default export) + tipos auxiliares.
- Props tipadas inline com `{}`-destructure:

  ```tsx
  export const MyCard = ({ title, body }: { title: string; body: ReactNode }) => {
    return <div>...</div>;
  };
  ```

- Handlers nomeados `handleX`:
  ```tsx
  const handleSubmit = (e: FormEvent) => { ... };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit(e);
  };
  ```

### Estilo visual
- Tailwind puro. Sem CSS files, sem CSS-in-JS.
- Usar `cn()` de `lib/utils.ts` para combinar classes condicionais:
  ```tsx
  <button className={cn("rounded-xl px-3 py-2", isActive && "bg-canopy-600 text-white")} />
  ```
- Paleta custom: `canopy-*` (verde), `bark-*` (marrom). Dark mode via
  variante `dark:` sempre.

### Acessibilidade
- Todo `<button>` / `<div role="button">` / `<li>` interativo tem:
  - `tabIndex={0}` (se não for nativo focável)
  - `role` quando semântica não é nativa
  - `aria-label` quando o texto não for auto-descritivo
  - `onKeyDown` tratando Enter/Space
- Ícones decorativos: `aria-hidden`.

### Fetch / rede
- **Somente** via `lib/api.ts`. Componentes chamam `api.X(...)`.
- Tipos de resposta em `lib/types.ts`.
- Erros capturados com try/catch; mostrar mensagem amigável em PT-BR.

### Arquivo de tipos
```ts
// lib/types.ts — toda interface REST vive aqui
export type Phase = "seedling" | "veg" | "flora";
export interface CycleDoc { ... }
```

---

## Linguagem

| Camada           | Idioma |
|------------------|--------|
| Código Python    | inglês |
| Código TS        | inglês |
| Nomes de variável| inglês |
| Docstrings       | inglês no core; PT-BR se for destinado ao usuário |
| Comentários      | PT-BR (é a língua do dono, agiliza leitura)       |
| Strings de UI    | PT-BR sempre                                      |
| Mensagens de erro visíveis ao usuário | PT-BR                         |
| Mensagens internas (logs) | inglês                                   |
| Git commits      | inglês (padrão do dono)                           |

---

## Git

- Commits no imperativo, em inglês: `add strain research endpoint`.
- Scope opcional: `backend: add strain research endpoint`.
- Nunca commitar `.env*` (exceto `.env.example`).
- Nunca commitar `serviceAccount.json`.
- Nunca commitar `node_modules/`, `.next/`, `__pycache__/`, `dist/`.

---

## Testes

### Core
- `pytest` + fixtures em `tests/fixtures/`.
- Cada regra tem teste positivo + negativo.
- 100% dos tests passando antes de PR.

### Backend
- Cliente de teste Flask (`app.test_client()`).
- Mock do `FirebaseService` via fixture.
- Mock do `GeminiProvider` com respostas pré-gravadas.

### Frontend
- (pendente, não bloqueia v1) — Vitest + React Testing Library quando
  for prioridade.

---

## Antipadrões universais

- Copy-paste entre core/backend/frontend. Se a regra existe em dois
  lugares, está no lugar errado.
- Hardcode de URL do Render/Vercel. Sempre env var.
- Silenciar exceção com `except: pass`. Sempre logar + re-raise ou
  fallback explícito.
- PRs gigantes. Máx 400 linhas de diff por PR, preferencialmente.
