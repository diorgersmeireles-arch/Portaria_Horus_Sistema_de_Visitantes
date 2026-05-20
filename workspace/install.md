# Instalação - Portaria Horus

## Pré-requisitos

- **Python**: 3.8 ou superior
- **Sistema Operacional**: Windows, Linux ou macOS
- **Webcam**: Necessária para captura de foto (opcional)
- **Navegador**: Chrome, Firefox, Edge ou Safari

## Métodos de Instalação

### 1. Instalação Local (Desenvolvimento)

#### Windows (PowerShell)

```powershell
# Clone o repositório
git clone https://github.com/seu-repo/Portaria_Horus_Sistema_de_Visitantes.git
cd Portaria_Horus_Sistema_de_Visitantes

# Crie um ambiente virtual (opcional)
python -m venv venv
.\venv\Scripts\Activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
$env:HORUS_TZ="America/Sao_Paulo"
$env:HORUS_BASE_CLASS_TIME="07:30"

# Execute o servidor
python app.py
```

#### Linux/macOS (Bash)

```bash
# Clone o repositório
git clone https://github.com/seu-repo/Portaria_Horus_Sistema_de_Visitantes.git
cd Portaria_Horus_Sistema_de_Visitantes

# Crie um ambiente virtual (opcional)
python3 -m venv venv
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
export HORUS_TZ="America/Sao_Paulo"
export HORUS_BASE_CLASS_TIME="07:30"

# Execute o servidor
python app.py
```

#### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `HORUS_TZ` | Fuso horário | `America/Sao_Paulo` |
| `HORUS_BASE_CLASS_TIME` | Horário base de entrada (HH:MM) | `07:30` |
| `SECRET_KEY` | Chave secreta para sessões | `dev-key-horus` |

### 2. Instalação com Docker

#### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HORUS_TZ=America/Sao_Paulo
ENV HORUS_BASE_CLASS_TIME=07:30

EXPOSE 5000

CMD ["python", "app.py"]
```

#### Build e Execução

```bash
# Build da imagem
docker build -t portaria-horus .

# Executar o container
docker run -d -p 5000:5000 \
  -e HORUS_TZ=America/Sao_Paulo \
  -e HORUS_BASE_CLASS_TIME=07:30 \
  -v $(pwd)/horus.db:/app/horus.db \
  -v $(pwd)/photos:/app/photos \
  --name portaria-horus \
  portaria-horus
```

#### Docker Compose

```yaml
version: '3.8'

services:
  horus:
    build: .
    ports:
      - "5000:5000"
    environment:
      - HORUS_TZ=America/Sao_Paulo
      - HORUS_BASE_CLASS_TIME=07:30
    volumes:
      - ./horus.db:/app/horus.db
      - ./photos:/app/photos
    restart: unless-stopped
```

### 3. Instalação em Servidor (Produção)

#### Usando Gunicorn

```bash
# Instale gunicorn
pip install gunicorn

# Execute com gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Usando systemd (Linux)

Crie o arquivo `/etc/systemd/system/horus.service`:

```ini
[Unit]
Description=Portaria Horus
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/portaria-horus
Environment="PATH=/opt/portaria-horus/venv/bin"
Environment="HORUS_TZ=America/Sao_Paulo"
Environment="HORUS_BASE_CLASS_TIME=07:30"
ExecStart=/opt/portaria-horus/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Ative o serviço
sudo systemctl daemon-reload
sudo systemctl enable horus
sudo systemctl start horus
```

### 4. Instalação no Windows com IIS

1. Instale o Python via Microsoft Store ou site oficial
2. Instale wfastcgi: `pip install wfastcgi`
3. Configure o IIS com FastCGI
4. Adicione o site apontando para o diretório do projeto

### 5. Instalação em Nuvem

#### Heroku

```bash
# Crie o app
heroku create portaria-horus

# Configure variáveis
heroku config:set HORUS_TZ=America/Sao_Paulo
heroku config:set HORUS_BASE_CLASS_TIME=07:30

# Deploy
git push heroku main
```

#### Railway

1. Conecte o repositório no Railway
2. Configure as variáveis de ambiente
3. Deploy automático

#### Render

1. Conecte o repositório no Render
2. Configure o build command: `pip install -r requirements.txt`
3. Configure o start command: `python app.py`
4. Adicione as variáveis de ambiente

## Verificação da Instalação

Após executar `python app.py`, verifique:

1. Acesse `http://127.0.0.1:5000`
2. Verifique se o banco `horus.db` foi criado
3. Verifique se a pasta `photos` foi criada
4. Teste o registro de visitante
5. Teste a captura de foto (se disponível)

## Estrutura de Arquivos Criados

```
seu-diretorio/
├── app.py                  # Aplicação principal
├── horus.db               # Banco de dados SQLite
├── photos/               # Pasta de fotos (criada automaticamente)
├── requirements.txt      # Dependências
├── static/
│   └── style.css
└── templates/
    └── [templates HTML]
```

## Solução de Problemas

### Erro de permissão na pasta photos
```bash
# Linux/Mac
chmod 755 photos
```

### Porta já em uso
```bash
# Use outra porta
python app.py --port 5001
```

### Banco de dados corrompido
```bash
# Remova o banco e reinicie
rm horus.db
python app.py
```

### Erro de câmera
- Use HTTPS ou `http://localhost` para acesso
- Permita acesso à câmera no navegador

## Atualização

```bash
# Atualize o repositório
git pull origin main

# Atualize dependências
pip install -r requirements.txt --upgrade
```

## Backup

```bash
# Backup do banco
cp horus.db horus_backup.db

# Backup das fotos
cp -r photos photos_backup
```