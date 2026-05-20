# Sistema de Portaria Escolar - Requisitos

## Stack Recomendada
**Python (Flask/FastAPI) + HTML/CSS/JavaScript (Vanilla ou轻量框架)**

Vantagens:
- Python: backend robusto, fácil integração com banco de dados, bibliotecas para CSV, manipulação de datas
- Frontend: dashboard leve, sem necessidade de frameworks complexos como React/Vue para esta escala
- SQLite/PostgreSQL para dados locais ou PostgreSQL para produção

---

## Módulos

### 1. Home (Dashboard)
- KPIs: Total visitantes hoje, total alunos atrasados, visitantes na escola
- Atalhos快速 para: registrar visitante, registrar aluno, relatórios

### 2. Visitantes/Fornecedores
- **Cadastro**: nome, CPF, RG, tipo (visitante/fornecedor), telefone, empresa
- **Entrada/Saída**: registro de horário de entrada e saída
- **Foto na hora**: captura de webcam no momento do registro, retenção de 90 dias
- **Pesquisa**: busca por nome, CPF ou RG

### 3. Alunos
- **Cadastro manual**: nome, matrícula, série/turma, telefone responsável
- **Importação CSV**: upsert por matrícula (atualiza se existir, insere se não existir)
- **Registro de chegada**: horário de chegada na portaria
- **Cálculo de atraso**:
  - Base: `HORUS_BASE_CLASS_TIME` (padrão 07:30)
  - Registros após 07:30 são considerados atrasos
  - Cálculo automático no momento do registro

### 4. Relatórios
- **Filtro por período**: data inicial e data final
- **Export CSV**:
  - Relatório de visitas: visitante, entrada, saída, duração
  - Relatório de atrasos: aluno, horário chegada, minutos de atraso

---

## Observações
- Foto dos visitantes: armazenar em disco com data de expiração (90 dias), limpar automaticamente
- Backup/export dos dados: CSV para portability
- Ambiente variáveis para configurações (HORUS_BASE_CLASS_TIME, etc.)