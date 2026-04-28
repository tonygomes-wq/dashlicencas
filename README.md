# 🚀 Dashboard de Licenças

Sistema de gerenciamento de licenças de software (Bitdefender, FortiGate, Office 365, Gmail) com backend Node.js + TypeScript e frontend React.

## ✨ Status do Projeto

- ✅ **Frontend**: React + TypeScript + Vite
- ✅ **Backend**: Node.js + Express + TypeScript (Migração em andamento)
- ✅ **Banco de Dados**: MySQL
- ✅ **Deploy**: Easypanel (GitHub auto-deploy)

## 🎯 Migração PHP → Node.js

### Status: Fase 1 Completa (33%)

- ✅ Estrutura base do backend
- ✅ Autenticação JWT
- ✅ CRUD Bitdefender completo
- ✅ Segurança implementada
- ⏳ Endpoints adicionais
- ⏳ Migração de outros módulos

### 📚 Documentação da Migração

| Documento | Descrição |
|-----------|-----------|
| **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** | Começar em 5 minutos |
| **[COMO_CONTINUAR.md](COMO_CONTINUAR.md)** | Próximos passos |
| **[GUIA_MIGRACAO_NODEJS.md](GUIA_MIGRACAO_NODEJS.md)** | Guia completo |
| **[CHECKLIST_MIGRACAO.md](CHECKLIST_MIGRACAO.md)** | Progresso |
| **[COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)** | Comandos úteis |
| **[INDICE_DOCUMENTACAO.md](INDICE_DOCUMENTACAO.md)** | Índice completo |

## 🚀 Início Rápido

### Frontend

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Backend (Node.js)

```bash
# Entrar na pasta
cd backend

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🏗️ Arquitetura

```
Frontend (React + TypeScript)
      ↓
   JWT Token
      ↓
Backend (Node.js + Express + TypeScript)
      ↓
MySQL Database
```

## 📊 Funcionalidades

### ✅ Implementadas
- Dashboard com visão geral
- Gerenciamento de licenças Bitdefender
- Gerenciamento de dispositivos FortiGate
- Gerenciamento de contas Office 365
- Gerenciamento de contas Gmail
- Autenticação JWT
- Sistema de permissões (Admin/User)
- Alertas de vencimento
- Indicador de uso de licença

### ⏳ Em Desenvolvimento
- Sincronização automática com APIs
- Estatísticas avançadas
- Relatórios
- Notificações por email

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Bcrypt para senhas
- ✅ Helmet (headers HTTP)
- ✅ CORS configurável
- ✅ SQL injection protection
- ✅ Role-based access control

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Router

### Backend
- Node.js 20
- Express.js
- TypeScript
- MySQL2
- JWT
- Bcrypt
- Helmet

## 📝 Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dashlicencas
JWT_SECRET=seu_secret_seguro
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Deploy

### Easypanel
1. Push para GitHub
2. Easypanel faz deploy automático
3. Configurar variáveis de ambiente
4. Acessar: https://dashlicencas.macip.com.br

## 📚 Documentação Adicional

- [Backend README](backend/README.md)
- [Guia de Migração](GUIA_MIGRACAO_NODEJS.md)
- [Apresentação](APRESENTACAO_MIGRACAO.md)
- [Resumo Visual](RESUMO_VISUAL.txt)

## 🐛 Troubleshooting

Consulte [COMO_CONTINUAR.md](COMO_CONTINUAR.md) para soluções de problemas comuns.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa no [INDICE_DOCUMENTACAO.md](INDICE_DOCUMENTACAO.md).

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

**Última atualização**: 28/04/2026  
**Versão**: 2.0.0 (Migração Node.js)  
**Status**: Em desenvolvimento ativo 🚀