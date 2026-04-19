# Mission 01 — Provisionar Firebase

**Objetivo:** ter Firestore + Storage prontos e `backend/.env` configurado.

**Tempo estimado:** 10 min (9 min cliques no console + 1 min no código).

---

## Passo a passo

### 1. Criar projeto no Firebase

1. Abrir https://console.firebase.google.com
2. **Adicionar projeto** → nome sugerido: `coach-de-cultivo`
3. Google Analytics: **desabilitar** (não precisamos)
4. Aguardar provisionamento

### 2. Habilitar Firestore

1. No menu lateral: **Firestore Database → Criar banco de dados**
2. Modo: **produção** (regras restritas por padrão)
3. Localização: `southamerica-east1` (São Paulo)

### 3. Habilitar Storage

1. Menu lateral: **Storage → Começar**
2. Regras: **produção**
3. Mesma localização: `southamerica-east1`

### 4. Criar service account

1. **Project settings** (ícone de engrenagem) → aba **Service accounts**
2. **Gerar nova chave privada** → baixa `serviceAccount.json`
3. Salvar em `backend/serviceAccount.json`
4. **IMPORTANTE:** esse arquivo já está no `.gitignore`. Confirmar com:
   ```bash
   git check-ignore backend/serviceAccount.json
   ```
   Deve imprimir o caminho (significa que está ignorado).

### 5. Regras de segurança (mínimo viável)

**Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // só service account
    }
  }
}
```

**Storage Rules:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;  // só service account
    }
  }
}
```

A app só acessa via Admin SDK (service account), que bypass as rules.

### 6. Popular `backend/.env`

```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
FIREBASE_STORAGE_BUCKET=coach-de-cultivo.appspot.com
```

(Use o bucket default do projeto — ver em Storage → começa com o project id.)

### 7. Validar

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -c "from app.services.firebase_service import FirebaseService; FirebaseService.init(); print('ok')"
```

Deve imprimir `ok`. Se der erro de credencial, revisar passo 4.

---

## Checklist final

- [ ] Projeto Firebase criado em `southamerica-east1`.
- [ ] Firestore habilitado.
- [ ] Storage habilitado.
- [ ] `backend/serviceAccount.json` presente e no `.gitignore`.
- [ ] `backend/.env` com `FIREBASE_*` preenchido.
- [ ] Smoke test (`FirebaseService.init()`) passou.

**Próxima missão:** [02-gemini.md](./02-gemini.md)
