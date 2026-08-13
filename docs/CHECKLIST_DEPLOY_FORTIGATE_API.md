# ✅ Checklist de Deploy - FortiGate API Integration

## 📋 Pré-Deploy

- [ ] Build do frontend executado com sucesso (`npm run build`)
- [ ] Todos os arquivos commitados no Git
- [ ] Backup do banco de dados realizado
- [ ] Variável `ENCRYPTION_KEY` preparada (32+ caracteres)
- [ ] Token de API do FortiGate disponível

## 🗄️ Banco de Dados

- [ ] **Aplicar SQL das tabelas**
  ```bash
  mysql -u root -p dashlicencas < db_init/create_fortigate_api_tables.sql
  ```

- [ ] **Verificar criação das tabelas**
  ```sql
  USE dashlicencas;
  SHOW TABLES LIKE 'fortigate_%';
  ```
  Deve retornar 4 tabelas:
  - `fortigate_alerts`
  - `fortigate_api_config`
  - `fortigate_devices_extended`
  - `fortigate_sync_history`

- [ ] **Verificar estrutura das tabelas**
  ```sql
  DESCRIBE fortigate_api_config;
  DESCRIBE fortigate_devices_extended;
  ```

## 🔐 Configuração de Segurança

- [ ] **Gerar chave de criptografia**
  ```bash
  openssl rand -base64 32
  # OU
  php -r "echo bin2hex(random_bytes(32));"
  ```

- [ ] **Configurar variável de ambiente**
  - Opção 1: Adicionar ao `.env`
    ```bash
    echo 'ENCRYPTION_KEY=sua_chave_aqui' >> .env
    ```
  - Opção 2: Adicionar ao ambiente do sistema
    ```bash
    export ENCRYPTION_KEY="sua_chave_aqui"
    ```

- [ ] **Verificar se variável está configurada**
  ```bash
  php -r "echo getenv('ENCRYPTION_KEY') ? 'OK' : 'ERRO';"
  ```

## 📦 Deploy do Código

- [ ] **Commit das alterações**
  ```bash
  git add .
  git commit -m "feat: Adiciona integração FortiGate API com sincronização automática"
  ```

- [ ] **Push para repositório**
  ```bash
  git push origin main
  ```

- [ ] **Aguardar deploy automático no Easypanel**
  - Verificar logs no painel do Easypanel
  - Confirmar que deploy foi concluído sem erros

- [ ] **Verificar arquivos no servidor**
  ```bash
  ls -la srv/FortigateAPI.php
  ls -la srv/FortigateSync.php
  ls -la app_fortigate_api.php
  ls -la dist/assets/
  ```

## 🌐 Verificação do Frontend

- [ ] **Acessar o sistema**
  - URL: `https://seu-dominio.com`

- [ ] **Limpar cache do navegador**
  - Windows/Linux: `Ctrl + Shift + R`
  - Mac: `Cmd + Shift + R`

- [ ] **Verificar Dashboard**
  - Card "FortiGate API" deve aparecer
  - Estatísticas devem estar zeradas inicialmente

- [ ] **Verificar página Fortigate**
  - Coluna "API" deve aparecer na tabela
  - Botões de configuração e sincronização devem estar visíveis

- [ ] **Testar modal de configuração**
  - Clicar no ícone de engrenagem (Settings)
  - Modal deve abrir corretamente
  - Todos os campos devem estar visíveis

## 🔧 Configuração Inicial

- [ ] **Obter token do FortiGate**
  - Acessar FortiGate: `https://IP-DO-FORTIGATE`
  - System → Administrators → Create New → REST API Admin
  - Copiar token gerado

- [ ] **Configurar primeiro dispositivo**
  - Abrir modal de configuração
  - Preencher:
    - IP do FortiGate
    - Token de API
    - Porta: 443
    - Verificar SSL: ❌ (desmarcar para testes)
    - Intervalo: 60 minutos
  - Clicar em "Testar Conexão"
  - Aguardar resultado

- [ ] **Verificar teste de conexão**
  - Deve retornar "Conexão estabelecida com sucesso"
  - Se falhar, verificar:
    - IP correto
    - Token válido
    - Firewall liberado
    - Trusted Hosts configurado no FortiGate

- [ ] **Salvar configuração**
  - Clicar em "Salvar"
  - Aguardar confirmação

- [ ] **Executar primeira sincronização**
  - Clicar em "Sincronizar Agora"
  - Aguardar conclusão
  - Verificar mensagem de sucesso

## 🗃️ Verificação no Banco de Dados

- [ ] **Verificar configuração salva**
  ```sql
  SELECT * FROM fortigate_api_config WHERE device_id = 1;
  ```
  - `api_enabled` deve ser `TRUE`
  - `last_sync_status` deve ser `success`
  - `last_sync_at` deve ter data/hora recente

- [ ] **Verificar dados estendidos**
  ```sql
  SELECT * FROM fortigate_devices_extended WHERE device_id = 1;
  ```
  - Deve ter dados de hostname, versão, CPU, etc.

- [ ] **Verificar histórico**
  ```sql
  SELECT * FROM fortigate_sync_history 
  WHERE device_id = 1 
  ORDER BY sync_started_at DESC 
  LIMIT 1;
  ```
  - `status` deve ser `success`
  - `duration_seconds` deve ter valor

- [ ] **Verificar alertas**
  ```sql
  SELECT * FROM fortigate_alerts 
  WHERE device_id = 1 
  AND is_resolved = FALSE;
  ```
  - Pode ter alertas se licenças estiverem expirando

## 📊 Verificação do Dashboard

- [ ] **Atualizar Dashboard**
  - Recarregar página (F5)
  - Card "FortiGate API" deve mostrar:
    - Dispositivos Configurados: 1
    - Sincronizados (1h): 1
    - Alertas (se houver)

- [ ] **Verificar tabela FortiGate**
  - Botão de sincronização deve estar ativo
  - Clicar para testar sincronização manual
  - Deve completar em poucos segundos

## ⏰ Configuração do Cron Job (Opcional)

- [ ] **Tornar script executável**
  ```bash
  chmod +x cron_fortigate_sync.php
  ```

- [ ] **Testar script manualmente**
  ```bash
  php cron_fortigate_sync.php
  ```
  - Deve executar sem erros
  - Deve mostrar log de sincronização

- [ ] **Criar diretório de logs**
  ```bash
  sudo mkdir -p /var/log
  sudo touch /var/log/fortigate_sync.log
  sudo chmod 666 /var/log/fortigate_sync.log
  ```

- [ ] **Configurar crontab**
  ```bash
  crontab -e
  ```
  Adicionar linha:
  ```
  0 * * * * php /caminho/completo/cron_fortigate_sync.php >> /var/log/fortigate_sync.log 2>&1
  ```

- [ ] **Verificar cron configurado**
  ```bash
  crontab -l
  ```

- [ ] **Aguardar próxima execução**
  - Verificar logs após 1 hora
  ```bash
  tail -f /var/log/fortigate_sync.log
  ```

## 🧪 Testes Finais

- [ ] **Teste de sincronização manual**
  - Clicar em "Sincronizar" na tabela
  - Deve completar com sucesso
  - Dashboard deve atualizar

- [ ] **Teste de sincronização em massa**
  - Configurar mais de um dispositivo
  - Clicar em "Sincronizar Todos" no Dashboard
  - Todos devem sincronizar

- [ ] **Teste de alertas**
  - Verificar se alertas aparecem no Dashboard
  - Testar resolução de alertas (se houver)

- [ ] **Teste de histórico**
  - Verificar se histórico está sendo registrado
  - Múltiplas sincronizações devem aparecer

- [ ] **Teste de permissões**
  - Login como usuário não-admin
  - Verificar que não pode configurar API
  - Verificar que pode visualizar estatísticas

## 📝 Documentação

- [ ] **Documentar configurações**
  - IPs dos FortiGates configurados
  - Intervalos de sincronização
  - Alertas configurados

- [ ] **Criar guia para usuários**
  - Como visualizar estatísticas
  - Como interpretar alertas
  - Como sincronizar manualmente

- [ ] **Documentar troubleshooting**
  - Problemas comuns e soluções
  - Contatos de suporte

## ✅ Checklist de Sucesso

Marque todos os itens abaixo para confirmar deploy bem-sucedido:

- [ ] ✅ Tabelas criadas no banco de dados
- [ ] ✅ Variável ENCRYPTION_KEY configurada
- [ ] ✅ Frontend atualizado e funcionando
- [ ] ✅ Modal de configuração abre corretamente
- [ ] ✅ Teste de conexão funciona
- [ ] ✅ Primeira sincronização executada com sucesso
- [ ] ✅ Dados aparecem no banco de dados
- [ ] ✅ Dashboard mostra estatísticas corretas
- [ ] ✅ Sincronização manual funciona
- [ ] ✅ Cron job configurado (opcional)
- [ ] ✅ Logs sendo gerados corretamente
- [ ] ✅ Alertas funcionando (se aplicável)
- [ ] ✅ Permissões de usuário funcionando
- [ ] ✅ Documentação atualizada

## 🎉 Deploy Concluído!

Se todos os itens acima estão marcados, o deploy foi bem-sucedido!

**Próximos passos:**
1. Configurar demais dispositivos FortiGate
2. Monitorar logs de sincronização
3. Ajustar intervalos conforme necessário
4. Treinar usuários no uso do sistema

---

**Data do Deploy:** ___/___/______  
**Responsável:** _________________  
**Versão:** 1.0  
**Status:** ⬜ Em Progresso | ⬜ Concluído | ⬜ Com Problemas
