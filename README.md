# Portaria Horus

**Sistema de Gestão de Visitantes e Controle de Acesso para Instituições de Ensino**

[![Python](https://img.shields.io/badge/Python-3.x-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Descrição

O **Portaria HÓRUS** é um sistema completo para gerenciamento de portaria em escolas, colégios e faculdades. Controla cadastros, acessos e registros de visitantes, fornecedores e alunos, garantindo rastreabilidade, integridade e conformidade com a LGPD.

## Funcionalidades

### Visitantes e Fornecedores
- Cadastro completo (nome, CPF, RG, telefone, empresa)
- Registro de entrada/saída com horários
- Captura de foto via webcam no momento do registro
- Pesquisa por nome, CPF ou RG
- Retenção de fotos por 90 dias (limpeza automática)

### Controle de Alunos
- Cadastro manual de alunos
- Importação via CSV com upsert por matrícula
- Registro de chegada na portaria
- Cálculo automático de atrasos
- Controle de autorização para saída

### Dashboard
- Total de visitantes hoje
- Total de alunos atrasados
- Visitantes atualmente na escola
- Atalhos rápidos para ações principais

### Relatórios
- Filtro por período (data inicial e final)
- Exportação CSV de visitas e atrasos

## Tecnologias

- **Backend**: Python 3.x + Flask
- **Frontend**: HTML/CSS/JavaScript (Vanilla)
- **Banco de Dados**: SQLite (desenvolvimento)
- **Templates**: Jinja2

## Pré-requisitos

- Python 3.8+
- Câmera webcam (para captura de foto)

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-repo/Portaria_Horus_Sistema_de_Visitantes.git
cd Portaria_Horus_Sistema_de_Visitantes

# Criar ambiente virtual (opcional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\Activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

## Configuração

Defina as variáveis de ambiente antes de executar:

```powershell
# Windows (PowerShell)
$env:HORUS_TZ="America/Sao_Paulo"
$env:HORUS_BASE_CLASS_TIME="07:30"
```

```bash
# Linux/Mac
export HORUS_TZ="America/Sao_Paulo"
export HORUS_BASE_CLASS_TIME="07:30"
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `HORUS_TZ` | Fuso horário | `America/Sao_Paulo` |
| `HORUS_BASE_CLASS_TIME` | Horário base de entrada | `07:30` |

## Executando

```bash
python app.py
```

Acesse: `http://127.0.0.1:5000`

> **Nota**: A captura de foto funciona melhor em HTTPS ou `http://localhost`.

## Importação de Alunos (CSV)

O sistema suporta importação em massa via CSV.

**Cabeçalhos obrigatórios:**
```csv
matricula,nome_completo,turma
```

**Exemplo:**
```csv
matricula,nome_completo,turma
2024001,João Silva,1º Ano A
2024002,Maria Santos,1º Ano A
```

O sistema faz upsert: atualiza se a matrícula existir, insere se não existir.

## Estrutura do Projeto

```
Portaria_Horus_Sistema_de_Visitantes/
├── app.py                  # Aplicação principal
├── requirements.txt        # Dependências Python
├── horus.db               # Banco de dados (gerado automaticamente)
├── photos/                # Fotos de visitantes (90 dias de retenção)
├── static/
│   └── style.css          # Estilos CSS
├── templates/             # Templates HTML
│   ├── base.html         # Template base
│   ├── home.html         # Dashboard
│   ├── index.html        # Página inicial
│   ├── search.html       # Busca
│   ├── reports.html      # Relatórios
│   ├── students_home.html
│   ├── students_import.html
│   ├── students_new.html
│   └── students_checkin.html
└── workspace/             # Documentação
    ├── prompt.md
    ├── mapa.md
    └── diretoria.md
```

## Conformidade com LGPD

- Retenção de dados pessoais por tempo determinado
- Logs de auditoria para todas as operações
- Proteção de dados sensíveis (foto, CPF)
- Base de dados local (não exposta à internet)

## Licença

MIT License - © 2024 Portaria Horus

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request