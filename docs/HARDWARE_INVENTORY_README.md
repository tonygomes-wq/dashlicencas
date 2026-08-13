# Inventário de Hardware - Guia de Instalação

## 📋 Visão Geral

Nova funcionalidade de Inventário de Hardware adicionada ao Dashboard de Licenças. Permite gerenciar informações completas de dispositivos como PCs, notebooks, servidores e workstations.

## 🚀 Instalação

### 1. Criar as Tabelas no Banco de Dados

Execute o script SQL no seu banco de dados MySQL:

```bash
mysql -u faceso56_dashlicencas -p faceso56_dashlicencas < db_hardware_schema.sql
```

Ou execute manualmente o conteúdo do arquivo `db_hardware_schema.sql` no phpMyAdmin ou outro cliente MySQL.

### 2. Arquivos Criados

**Backend:**
- `app_hardware.php` - API REST para CRUD de hardware

**Frontend:**
- `src/components/HardwareInventoryTable.tsx` - Tabela de listagem
- `src/components/AddHardwareModal.tsx` - Modal para adicionar dispositivos
- `src/components/HardwareDetailModal.tsx` - Modal de detalhes/edição

**Tipos:**
- Adicionados em `src/types.ts`

**API Client:**
- Métodos adicionados em `src/lib/apiClient.ts`

**Dashboard:**
- Integração completa em `src/pages/Dashboard.tsx`

## ✨ Funcionalidades

### Informações Armazenadas

- **Básicas:** Nome, tipo, cliente, localização, status
- **Processador:** Modelo, núcleos, frequência
- **Memória:** Tamanho, tipo, velocidade
- **Armazenamento:** Múltiplos dispositivos (SSD, HDD, NVMe, M.2)
- **Sistema:** SO, versão
- **Rede:** MAC address, IP
- **Garantia:** Data de compra, vencimento da garantia
- **Extras:** Serial, fabricante, modelo, observações

### Recursos

✅ Adicionar/Editar/Excluir dispositivos
✅ Múltiplos dispositivos de armazenamento por equipamento
✅ Alertas de garantia (Expirada, Expira em 30 dias, Válida)
✅ Filtros por cliente, tipo, status
✅ Busca por nome ou serial
✅ Visualização detalhada de especificações
✅ Ícones visuais por tipo de dispositivo

## 🎨 Interface

A nova aba "Inventário" aparece ao lado de "Mapa de Rede" com ícone de HardDrive.

### Tipos de Dispositivos Suportados

- Desktop 🖥️
- Notebook 💻
- Servidor 🖧
- Workstation ⚙️
- Outro 📦

### Status de Dispositivos

- Ativo (verde)
- Inativo (cinza)
- Manutenção (amarelo)
- Descartado (vermelho)

## 🔧 Uso

1. Acesse a aba "Inventário" no dashboard
2. Clique em "Adicionar" para cadastrar novo dispositivo
3. Preencha as informações (campos obrigatórios: nome, tipo, cliente, CPU, RAM)
4. Adicione dispositivos de armazenamento conforme necessário
5. Clique em um dispositivo para ver detalhes completos

## 📊 Dados de Exemplo

O script SQL inclui 3 dispositivos de exemplo:
- PC-001 (Desktop)
- NB-045 (Notebook)  
- SRV-MAIN (Servidor)

Você pode removê-los após a instalação se desejar.

## 🔐 Permissões

A aba respeita as permissões existentes do sistema:
- Admins têm acesso total
- Usuários com permissão de edição podem adicionar/editar
- Usuários com permissão de exclusão podem remover dispositivos

## 🐛 Troubleshooting

**Erro ao carregar dados:**
- Verifique se as tabelas foram criadas corretamente
- Confirme que o arquivo `app_hardware.php` está acessível

**Aba não aparece:**
- Limpe o cache do navegador (Ctrl+F5)
- Verifique se o usuário tem permissões adequadas

**Erro ao adicionar dispositivo:**
- Verifique os campos obrigatórios
- Confirme a conexão com o banco de dados

## 📝 Próximas Melhorias Sugeridas

- Histórico de manutenções
- Integração com Mapa de Rede (vincular dispositivos aos nós)
- Importação em massa via CSV
- Relatórios de inventário por cliente
- Gráficos de distribuição de hardware
- Alertas automáticos de garantia vencendo

## 💡 Dicas

- Use nomes padronizados para facilitar busca (ex: PC-001, NB-045)
- Preencha o número de série para rastreamento
- Configure alertas de garantia para renovação proativa
- Mantenha as informações de rede atualizadas

---

Desenvolvido para Dashboard de Licenças - Macip Tecnologia
