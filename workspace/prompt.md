# Sistema de Portaria para Escolas, Colégios e Faculdades

## Visão Geral do Projeto

Desenvolver um sistema completo de gerenciamento de portaria para instituições de ensino (escolas, colégios e faculdades), com foco no controle de acesso de visitantes, alunos, professores e funcionários.

## Requisitos Funcionais

### 1. Gestão de Visitantes

- Cadastro de visitantes com dados pessoais (nome, CPF, telefone, email)
- Registro de motivo da visita
- Associação do visitante ao responsável ou departamento visitado
- Tempo estimado de permanência
- Geração de crachá temporário com foto
- Check-in e check-out com registro de horário
- Histórico completo de visitas por período

### 2. Gestão de Alunos

- Cadastro de alunos (dados pessoais, responsáveis, série/turma)
- Controle de entrada e saída
- Registro de atrasos e saídas antecipadas
- Notificação aos responsáveis em tempo real
- Integração com sistema escolar (quando existente)
- Controle de alunos autorizados a sair sozinhos

### 3. Gestão de Professores e Funcionários

- Cadastro de colaboradores com dados funcionais
- Registro de ponto de entrada/saída
- Controle de acesso por horário de trabalho
- Gestão de permissões por área

### 4. Controle de Acesso

- Portarias múltiplas (principal, secundária, cantina, etc.)
- Restrições de acesso por perfil
- Horários permitidos para entrada/saída
- Lista de pessoas não autorizadas
- Bloqueio automático após horário

### 5. Relatórios e Estatísticas

- Relatório de visitantes por período
- Relatório de frequência de alunos
- Dashboard em tempo real
- Exportação (PDF, Excel)
- Estatísticas de fluxo por horário

### 6. Segurança e Notificações

- Alertas de pessoas não autorizadas
- Notificações push para responsáveis
- Backup automático de dados
- Logs de auditoria
- Acesso via biometria (opcional)

## Requisitos Técnicos

- Backend em Python (Flask/Django) ou Node.js
- Frontend responsivo (React/Vue ou similar)
- Banco de dados PostgreSQL ou MySQL
- API REST para integrações
- Autenticação JWT
- Deploy em nuvem (AWS, Azure ou similar)
- Conformidade com LGPD

## Interfaces Principais

1. **Tela Inicial**: Dashboard com estatísticas em tempo real
2. **Cadastro de Visitantes**: Formulário completo com upload de foto
3. **Registro de Entrada/Saída**: Interface rápida para check-in/check-out
4. **Busca**: Pesquisa por nome, CPF, RA ou código de acesso
5. **Relatórios**: Filtros e exportação de dados
6. **Administração**: Gestão de usuários, permissões e configurações

## Personas

- **Porteiro/Administrativo**: Usuário principal do sistema
- **Diretor/Coordenador**: Acesso a relatórios e configurações
- **Responsável**: Recebe notificações sobre filho/aluno
- **Professor**: Consulta frequência da turma
- **Desenvolvedor**: Implementação e manutenção

## Prioridades

1. Cadastro e registro de visitantes (MVP)
2. Controle de alunos
3. Relatórios e estatísticas
4. Notificações
5. Integrações futuras

estrutura atual do sistema (Portaria HÓRUS).

1. Visão Geral do Sistema Atual
O sistema foi construído de forma bem objetiva e direta. A arquitetura atual é:

Backend: Python com Flask (Monolítico, tudo concentrado no app.py).
Banco de Dados: SQLite (usando Flask-SQLAlchemy).
Frontend: HTML, CSS nativo e Jinja2 (renderização no servidor).
Armazenamento: Fotos salvas localmente em disco (pasta photos).
Para um MVP (Produto Mínimo Viável) ou um protótipo, a estrutura funciona bem. No entanto, para ser considerado um sistema completo, seguro e pronto para produção, ele possui lacunas críticas.

1. O que falta para ser um sistema "Completo"?
Aqui estão os pontos de atenção imediatos para evoluir a aplicação:

Segurança e Acesso (Crítico para LGPD):

Autenticação e Autorização: O sistema não possui tela de login ou perfis de usuário. Qualquer pessoa na rede com o link acessa tudo. É necessário criar níveis de acesso (ex: Administrador, Portaria, Coordenação).
Logs e Auditoria (Traceability): Não há registro de quem fez cada ação. Saber qual porteiro fez o check-in ou quem alterou o cadastro de um aluno é vital.
Infraestrutura e Escalabilidade:

Banco de Dados Robusto: O SQLite não é recomendado para ambientes de produção com acessos simultâneos. O ideal é migrar para PostgreSQL ou MySQL.
Armazenamento de Arquivos: As fotos salvas no disco local dificultam o deploy em serviços de nuvem modernos (que costumam ter sistemas de arquivos efêmeros). Seria ideal usar um bucket na nuvem (como AWS S3) ou um servidor de mídia isolado.
Servidor de Produção: O código usa app.run(), que é o servidor de desenvolvimento nativo do Flask e não suporta tráfego de produção. Precisaria ser envelopado com Gunicorn (Linux) ou Waitress (Windows).
Organização de Código:

Separação de Responsabilidades: O app.py tem quase 500 linhas misturando Rotas, Regras de Negócio e Modelos de Banco de Dados. Em um sistema completo, isso deve ser separado (usando Blueprints no Flask ou arquitetura MVC).
Validação de Dados Estruturada: As validações hoje são feitas com if/else. Faltam bibliotecas robustas para validar formulários e evitar SQL Injection (ex: WTForms ou Marshmallow).
3. Vale a pena trocar a Stack?
Depende dos seus objetivos futuros para o sistema.

Opção A: Evoluir a stack atual (Manter Python/Flask)

Quando escolher: Se a equipe já domina Python e a ideia é apenas estabilizar o sistema para uso interno imediato.
O que fazer: Refatorar o código, instalar o Flask-Login para autenticação, migrar para PostgreSQL, criar rotas de API isoladas e fazer deploy com Docker.
Ponto negativo: A interface continuará mais "tradicional" (com a página recarregando a cada clique), a menos que muito JavaScript seja injetado nas páginas.
Opção B: Trocar para uma Stack Moderna (Recomendado)

Quando escolher: Se você quer que o sistema se torne um produto comercial (SaaS), tenha um design visual mais premium/dinâmico, ou precise rodar em totens, tablets e celulares de forma fluida.
Sugestão de Stack Moderna:
Frontend: React (Next.js ou Vite) + TailwindCSS. Isso permite criar interfaces belíssimas, ágeis (Single Page Application), modais instantâneos e interações sem recarregar a página.
Backend: Você pode manter Python (usando um framework mais moderno para APIs como FastAPI) ou unificar tudo usando Node.js/Next.js no próprio frontend.
Banco de Dados: PostgreSQL hospedado na nuvem.
Por que trocar? Com uma stack baseada em React/Next.js, a experiência do usuário (UX) salta de nível. A captura da webcam, exibição de gráficos em tempo real na Home e pesquisas por alunos funcionariam de forma muito mais rápida.
Conclusão: Se você deseja escalar, ter controle de segurança real (LGPD) e entregar um sistema que "encha os olhos" do usuário final, vale a pena reconstruir o frontend com uma stack moderna (Next.js/React) e deixar o backend como uma API (que pode continuar sendo Python, migrando de Flask para FastAPI, ou mudando para Node).
