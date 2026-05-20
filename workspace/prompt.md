# Portaria Horus - Sistema de Controle de Visitantes

## Descrição do Projeto

Sistema de gerenciamento de portaria para instituições de ensino (escolas, colégios e faculdades), desenvolvido em Python com Flask. Controle de acesso de visitantes, alunos, professores e funcionários com registro de horário e geração de relatórios.

## Stack Tecnológico

- **Backend**: Python 3.x + Flask
- **Frontend**: HTML/CSS/JavaScript (Vanilla)
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Templates**: Jinja2

## Estrutura do Projeto

```
├── app.py                 # Aplicação principal Flask
├── requirements.txt       # Dependências Python
├── templates/             # Templates HTML
│   ├── base.html         # Template base
│   ├── home.html         # Dashboard
│   ├── index.html        # Página inicial
│   ├── search.html       # Busca de registros
│   ├── reports.html      # Relatórios
│   ├── students_home.html
│   ├── students_import.html
│   ├── students_new.html
│   └── students_checkin.html
├── static/
│   └── style.css         # Estilos CSS
└── workspace/
    ├── prompt.md         # Este arquivo
    ├── mapa.md          # Requisitos e módulos
    ├── plano.md         # Planejamento
    └── diretoria.md    # Documentação executiva
```

## Configuração

Variáveis de ambiente:
- `HORUS_BASE_CLASS_TIME`: Horário base de entrada (padrão: 07:30)

## Executando o Projeto

```bash
pip install -r requirements.txt
python app.py
```

Acesse: http://localhost:5000

## Funcionalidades

### Dashboard (Home)
- Total de visitantes hoje
- Total de alunos atrasados
- Visitantes atualmente na escola
- Atalhos para: registrar visitante, registrar aluno, relatórios

### Módulo Visitantes/Fornecedores
- Cadastro: nome, CPF, RG, tipo (visitante/fornecedor), telefone, empresa
- Registro de entrada/saída com horários
- Captura de foto via webcam no momento do registro
- Pesquisa por nome, CPF ou RG
- Retenção de fotos por 90 dias

### Módulo Alunos
- Cadastro manual: nome, matrícula, série/turma, telefone do responsável
- Importação CSV com upsert por matrícula
- Registro de chegada na portaria
- Cálculo automático de atraso (após 07:30)
- Controle de alunos autorizados a sair sozinhos

### Relatórios
- Filtro por período (data inicial e final)
- Exportação CSV:
  - Relatório de visitas: visitante, entrada, saída, duração
  - Relatório de atrasos: aluno, horário de chegada, minutos de atraso

## Requisitos Funcionais

1. **Gestão de Visitantes**: Cadastro completo, check-in/check-out, geração de crachá temporário
2. **Gestão de Alunos**: Cadastro, controle de entrada/saída, cálculo de atrasos
3. **Controle de Acesso**: Registro de horário, restrições por perfil
4. **Relatórios**: Exportação CSV, filtros por período, estatísticas
5. **Segurança**: Backup de dados, logs de auditoria, conformidade com LGPD

## Personas

- **Porteiro/Administrativo**: Usuário principal do sistema
- **Diretor/Coordenador**: Acesso a relatórios e configurações
- **Responsável**: Recebe notificações sobre filho/aluno
- **Desenvolvedor**: Implementação e manutenção

## Roadmap

### Fase 1 - MVP (Concluído)
- [x] Cadastro e registro de visitantes
- [x] Cadastro de alunos
- [x] Registro de entrada/saída
- [x] Captura de foto
- [x] Relatórios CSV

### Fase 2 - Próximas Implementações
- [ ] Notificações push para responsáveis
- [ ] Dashboard em tempo real
- [ ] Integração com sistema escolar
- [ ] Autenticação por biometria (opcional)
- [ ] API REST para integrações

### Fase 3 - Expansão
- [ ] Módulo de professores e funcionários
- [ ] Portarias múltiplas
- [ ] Deploy em nuvem
- [ ] Backup automático