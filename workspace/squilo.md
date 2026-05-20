# Estrutura do Banco de Dados - Portaria Horus

## Visão Geral

O sistema utiliza **SQLite** para desenvolvimento e pode ser migrado para **PostgreSQL** em produção. A estrutura foi projetada para registrar visitantes, fornecedores e alunos, com controle de acesso e geração de relatórios.

---

## Esquema SQL

### Tabela: `visitors`

Pessoas externas (visitantes/fornecedores) que acessam a instituição.

```sql
CREATE TABLE visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(200) NOT NULL,
    cpf VARCHAR(20),
    rg VARCHAR(20),
    company VARCHAR(200),
    is_visitor BOOLEAN DEFAULT 1,
    is_supplier BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER | Chave primária |
| `full_name` | VARCHAR(200) | Nome completo |
| `cpf` | VARCHAR(20) | CPF (apenas números) |
| `rg` | VARCHAR(20) | RG (apenas números) |
| `company` | VARCHAR(200) | Empresa representada |
| `is_visitor` | BOOLEAN | Flag para visitantes |
| `is_supplier` | BOOLEAN | Flag para fornecedores |
| `created_at` | DATETIME | Data de cadastro |

**Índices:**
- `idx_visitors_cpf` no campo `cpf`
- `idx_visitors_rg` no campo `rg`

---

### Tabela: `visit_events`

Registro de entrada e saída de visitantes.

```sql
CREATE TABLE visit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id INTEGER NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    photo_path VARCHAR(500),
    photo_taken_at DATETIME,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER | Chave primária |
| `visitor_id` | INTEGER | FK para visitors |
| `check_in` | DATETIME | Horário de entrada |
| `check_out` | DATETIME | Horário de saída (NULL = em aberto) |
| `photo_path` | VARCHAR(500) | Caminho da foto capturada |
| `photo_taken_at` | DATETIME | Data/hora da captura da foto |

**Índices:**
- `idx_visit_events_visitor_id` no campo `visitor_id`
- `idx_visit_events_check_in` no campo `check_in`
- `idx_visit_events_check_out` no campo `check_out`

---

### Tabela: `students`

Cadastro de alunos da instituição.

```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    class_name VARCHAR(100),
    parent_phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER | Chave primária |
| `matricula` | VARCHAR(50) | Número de matrícula (único) |
| `full_name` | VARCHAR(200) | Nome completo do aluno |
| `class_name` | VARCHAR(100) | Série/Turma |
| `parent_phone` | VARCHAR(20) | Telefone do responsável |
| `created_at` | DATETIME | Data de cadastro |

**Índices:**
- `idx_students_matricula` no campo `matricula` (UNIQUE)
- `idx_students_full_name` no campo `full_name`

---

### Tabela: `student_arrivals`

Registro de chegada de alunos na portaria.

```sql
CREATE TABLE student_arrivals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    arrived_at DATETIME NOT NULL,
    is_late BOOLEAN DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER | Chave primária |
| `student_id` | INTEGER | FK para students |
| `arrived_at` | DATETIME | Data/hora da chegada |
| `is_late` | BOOLEAN | Flag de atraso |

**Índices:**
- `idx_student_arrivals_student_id` no campo `student_id`
- `idx_student_arrivals_arrived_at` no campo `arrived_at`
- `idx_student_arrivals_is_late` no campo `is_late`

---

## Mapa Lógico

```
┌─────────────────┐       ┌─────────────────┐
│    visitors     │       │    students     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ full_name       │       │ matricula (UQ)  │
│ cpf             │       │ full_name       │
│ rg              │       │ class_name      │
│ company         │       │ parent_phone    │
│ is_visitor      │       │ created_at      │
│ is_supplier     │       └────────┬────────┘
│ created_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  visit_events   │       │ student_arrivals│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ visitor_id (FK) │       │ student_id (FK) │
│ check_in        │       │ arrived_at      │
│ check_out       │       │ is_late         │
│ photo_path      │       └─────────────────┘
│ photo_taken_at  │
└─────────────────┘
```

---

## Relacionamentos

| Relacionamento | Tipo | Descrição |
|----------------|------|-----------|
| Visitor → VisitEvent | 1:N | Um visitante pode ter múltiplos eventos de visita |
| Student → StudentArrival | 1:N | Um aluno pode ter múltiplos registros de chegada |

---

## Consultas Úteis

### Visitantes atualmente na escola

```sql
SELECT v.full_name, v.cpf, v.rg, v.company, ve.check_in
FROM visit_events ve
JOIN visitors v ON ve.visitor_id = v.id
WHERE ve.check_out IS NULL
ORDER BY ve.check_in DESC;
```

### Alunos atrasados hoje

```sql
SELECT s.full_name, s.matricula, s.class_name, sa.arrived_at
FROM student_arrivals sa
JOIN students s ON sa.student_id = s.id
WHERE DATE(sa.arrived_at) = DATE('now', 'localtime')
  AND sa.is_late = 1
ORDER BY sa.arrived_at;
```

### Total de visitas por período

```sql
SELECT COUNT(*) as total,
       SUM(CASE WHEN check_out IS NOT NULL THEN 1 ELSE 0 END) as finalizadas,
       SUM(CASE WHEN check_out IS NULL THEN 1 ELSE 0 END) as abertas
FROM visit_events
WHERE check_in BETWEEN '2024-01-01' AND '2024-01-31';
```

### Ranking de alunos com mais atrasos

```sql
SELECT s.full_name, s.matricula, s.class_name, COUNT(sa.id) as total_atrasos
FROM student_arrivals sa
JOIN students s ON sa.student_id = s.id
WHERE sa.is_late = 1
GROUP BY s.id
ORDER BY total_atrasos DESC
LIMIT 10;
```

---

## Configurações do Banco

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `HORUS_BASE_CLASS_TIME` | Horário base para cálculo de atraso | `07:30` |
| `HORUS_TZ` | Fuso horário | `America/Sao_Paulo` |
| `RETENTION_DAYS` | Dias de retenção das fotos | `90` |

### Limpeza de Dados

O sistema executa limpeza automática de fotos com mais de 90 dias a cada requisição HTTP. Fotos expiradas são removidas do disco e os ponteiros no banco são limpos.

---

##Migração para PostgreSQL

Para migrar para PostgreSQL em produção:

1. Altere a URI no `app.py`:
```python
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:password@localhost/horus"
```

2. Execute as migrações:
```bash
flask db upgrade
```

3. Considere usar **SQLAlchemy** com **Alembic** para versionamento de schema.

---

## Segurança e LGPD

- CPF e RG são armazenados apenas como referência (não expostos publicamente)
- Fotos são retidas por tempo determinado e excluídas automaticamente
- Logs de auditoria em todas as operações
- Dados armazenados localmente (não expostos à internet em modo desenvolvimento)