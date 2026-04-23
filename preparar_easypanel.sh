#!/bin/bash

# Script de preparação para migração ao Easypanel
# Execute este script para preparar todos os arquivos necessários

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║              PREPARAÇÃO PARA MIGRAÇÃO AO EASYPANEL                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Verificar arquivos necessários
echo "1. Verificando arquivos necessários..."

if [ -f "Dockerfile" ]; then
    print_success "Dockerfile encontrado"
else
    print_error "Dockerfile não encontrado"
    exit 1
fi

if [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml encontrado"
else
    print_error "docker-compose.yml não encontrado"
    exit 1
fi

if [ -f "index.html" ]; then
    print_success "index.html encontrado"
else
    print_error "index.html não encontrado"
    exit 1
fi

echo ""

# 2. Criar pasta db_init
echo "2. Criando pasta db_init..."
mkdir -p db_init
print_success "Pasta db_init criada"
echo ""

# 3. Verificar se existe backup do banco
echo "3. Verificando backup do banco de dados..."
if [ -f "db_init/init.sql" ]; then
    print_success "Backup do banco encontrado em db_init/init.sql"
else
    print_warning "Backup do banco NÃO encontrado!"
    echo "   Por favor, exporte o banco de dados do phpMyAdmin e salve como:"
    echo "   db_init/init.sql"
    echo ""
    read -p "   Pressione Enter após exportar o banco..."
fi
echo ""

# 4. Criar .gitignore se não existir
echo "4. Criando .gitignore..."
cat > .gitignore << 'EOF'
# Node modules
node_modules/
npm-debug.log
package-lock.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Temporários
*.tmp
*.temp

# Ambiente
.env
.env.local

# Desenvolvimento
src/
vite.config.ts
tsconfig.json
package.json

# Documentação (opcional)
*.txt
!README.md
EOF
print_success ".gitignore criado"
echo ""

# 5. Criar README.md
echo "5. Criando README.md..."
cat > README.md << 'EOF'
# Dashboard de Licenças

Sistema de gerenciamento de licenças Bitdefender, Fortigate, Office 365 e Gmail.

## 🚀 Deploy no Easypanel

### Pré-requisitos

- Easypanel instalado
- Docker e Docker Compose

### Variáveis de Ambiente

```env
DB_HOST=db
DB_NAME=dashlicencas
DB_USER=dashlicencas_user
DB_PASSWORD=sua_senha_segura
```

### Deploy

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute: `docker-compose up -d`

### Acesso

- URL: http://seu-dominio.com
- Usuário padrão: admin@macip.com.br

## 📚 Documentação

Veja `MIGRACAO_EASYPANEL.md` para guia completo de migração.

## 🔧 Tecnologias

- Frontend: React + TypeScript + Vite
- Backend: PHP 8.2
- Banco de Dados: MySQL 8.0
- Servidor: Apache
- Container: Docker
EOF
print_success "README.md criado"
echo ""

# 6. Verificar estrutura de pastas
echo "6. Verificando estrutura de pastas..."

folders=("assets" "srv")
for folder in "${folders[@]}"; do
    if [ -d "$folder" ]; then
        print_success "Pasta $folder/ encontrada"
    else
        print_warning "Pasta $folder/ não encontrada"
    fi
done
echo ""

# 7. Contar arquivos PHP
echo "7. Verificando arquivos PHP..."
php_count=$(find . -maxdepth 1 -name "*.php" | wc -l)
print_success "Encontrados $php_count arquivos PHP"
echo ""

# 8. Verificar assets
echo "8. Verificando assets..."
if [ -f "assets/index-f981d49f.js" ]; then
    print_success "JavaScript compilado encontrado"
else
    print_warning "JavaScript compilado não encontrado"
fi

if [ -f "assets/index-bda104fb.css" ]; then
    print_success "CSS compilado encontrado"
else
    print_warning "CSS compilado não encontrado"
fi
echo ""

# 9. Criar script de deploy
echo "9. Criando script de deploy..."
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "Iniciando deploy..."

# Parar containers
docker-compose down

# Rebuild
docker-compose build --no-cache

# Iniciar
docker-compose up -d

# Verificar status
docker-compose ps

echo "Deploy concluído!"
EOF
chmod +x deploy.sh
print_success "Script deploy.sh criado"
echo ""

# 10. Resumo
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                              RESUMO                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Preparação concluída!"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Exportar banco de dados:"
echo "   - Acesse phpMyAdmin"
echo "   - Exporte o banco 'faceso56_dashlicencas'"
echo "   - Salve como: db_init/init.sql"
echo ""
echo "2. Inicializar Git (opcional):"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin https://github.com/seu-usuario/dashlicencas.git"
echo "   git push -u origin main"
echo ""
echo "3. Deploy no Easypanel:"
echo "   - Crie novo serviço"
echo "   - Conecte ao repositório Git"
echo "   - Configure variáveis de ambiente"
echo "   - Deploy!"
echo ""
echo "4. Ou deploy local:"
echo "   docker-compose up -d"
echo ""
print_success "Leia MIGRACAO_EASYPANEL.md para guia completo!"
echo ""
