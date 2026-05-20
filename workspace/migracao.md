# Plano de Migração - Sistema Portaria HÓRUS

## Visão Geral
Migração de MVP monolítico para arquitetura SaaS escalável.

---

## Stack Definida

| Componente | Tecnologia |
|------------|-------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI (Python) |
| Banco | PostgreSQL + SQLAlchemy 2.0 |
| Armazenamento | Supabase Storage (S3) |
| Autenticação | JWT com RBAC |

---

## Fase 1: Estrutura de Pastas (Clean Architecture)

### Estrutura Atual (monolítico)
```
/
├── app.py (500 linhas - tudo junto)
├── requirements.txt
├── templates/ (HTML inline)
└── static/
```

### Estrutura Nova (Backend)
```
backend/
├── main.py                 # Entry point FastAPI
├── app/
│   ├── __init__.py
│   ├── core/               # Configurações, segurança
│   │   ├── config.py       # JWT, password hash, dependências
│   │   ├── security.py     # Rate limiting, CORS
│   │   └── exceptions.py   # Custom exceptions
│   ├── models/             # SQLAlchemy models
│   │   ├── __init__.py     # Base, engine, session
│   │   ├── user.py
│   │   ├── visitor.py
│   │   ├── student.py
│   │   └── audit.py
│   ├── schemas/            # Pydantic schemas
│   │   ├── user.py
│   │   ├── visitor.py
│   │   └── student.py
│   ├── routers/           # Endpoints API
│   │   ├── auth.py         # Login, register
│   │   ├── visitors.py     # CRUD visitantes
│   │   ├── students.py     # CRUD alunos
│   │   ├── checkin.py      # Check-in/out
│   │   ├── reports.py      # Relatórios
│   │   └── admin.py        # Gestão sistema
│   ├── services/          # Lógica de negócio
│   │   ├── photo_service.py
│   │   ├── notification_service.py
│   │   └── analytics_service.py
│   └── utils/             # Helpers
├── alembic/               # Migrações DB
│   └── versions/
├── requirements.txt
└── .env.example
```

### Estrutura Nova (Frontend)
```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── api/               # Axios instance
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/            # Buttons, inputs, cards
│   │   ├── layout/        # Sidebar, Header
│   │   └── checkin/       # Componentes específicos
│   ├── pages/             # Rotas principais
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Checkin.jsx
│   │   ├── Visitors.jsx
│   │   ├── Students.jsx
│   │   └── Reports.jsx
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.js
│   │   └── useCheckin.js
│   ├── stores/            # Zustand/Context
│   └── utils/             # Helpers
```

---

## Fase 2: passo a passo da Refatoração

### Passo 1: Preparar ambiente
```bash
# Criar diretórios
mkdir -p backend/app/{core,models,schemas,routers,services,utils}
mkdir -p frontend/src/{api,components/{ui,layout,checkin},pages,hooks,stores,utils}

# Instalar dependências backend
cd backend
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic python-jose passlib[bcrypt] python-multipart

# Instalar dependências frontend
cd frontend
npm install
```

### Passo 2: Criar modelos (Models)
Copiar e adaptar as classes do `app.py` atual para arquivos separados em `backend/app/models/`.

### Passo 3: Criar schemas (Pydantic)
Criar schemas de request/response para cada entidade.

### Passo 4: Migrar rotas (Routers)
Cada rota do `app.py` vira um router:
- `/` (home) → dashboard router
- `/visit` → visitors router
- `/students/*` → students router
- `/reports` → reports router

### Passo 5: Implementar autenticação
- Criar `auth.py` com login JWT
- Proteger rotas com `Depends(require_role(...))`

### Passo 6: Frontend React
- Criar componentes base (Button, Input, Card)
- Implementar tela de check-in (prioritária)
- Criar sistema de rotas
- Integrar com API

### Passo 7:Migração de Dados
```python
# Script de migração SQLite → PostgreSQL
import sqlite3
import psycopg2

# Ler dados do SQLite antigo
# Inserir no PostgreSQL novo
```

---

## Fase 3: Conformidade LGPD

### Implementar:
1. **Anonimização** - Logs de auditoria não devem expor CPFs
2. **Consentimento** - Campo de aceite para tratamento de dados
3. **Direito de exclusão** - Endpoint para remover dados pessoais
4. **Retenção** - Fotos com TTL automático (90 dias)
5. **Logs de acesso** - Registrar quem acessou o que

---

## Fase 4: Funcionalidades Extras

### Módulo Visitantes
- [ ] Cadastro com upload de foto
- [ ] Crachá temporário (geração PDF)
- [ ]check-in/check-out com foto
- [ ] Lista de bloqueio

### Módulo Alunos
- [ ] Importação CSV (upsert)
- [ ] Chegada com cálculo de atraso
- [ ] Autorização de saída sozinha
- [ ] Notificação ao responsável

### Módulo Relatórios
- [ ] Dashboard com KPIs
- [ ] Exportação PDF/Excel
- [ ] Filtros por período

---

## Tempo Estimado

| Fase | Tempo |
|------|-------|
| Estrutura + Models | 1 dia |
| Auth + RBAC | 1 dia |
| Rotas API | 2 dias |
| Frontend Check-in | 1 dia |
| Frontend CRUDs | 2 dias |
| Migração Dados | 1 dia |
| **Total** | **~8 dias** |