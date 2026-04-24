// Execute este código no console do navegador (F12 -> Console)
// para verificar e corrigir os campos API da tabela FortiGate

fetch('https://dashlicencas.macip.com.br/verificar_e_adicionar_campos_api_fortigate.php', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    console.log('✅ RESULTADO DA VERIFICAÇÃO:', data);
    
    if (data.status === 'completed') {
        console.log('🎯 CAMPOS FINAIS:', data.final_columns);
        console.log('🔑 API Token existe:', data.has_api_token_final);
        console.log('🌐 API IP existe:', data.has_api_ip_final);
        
        if (data.actions_needed.length > 0) {
            console.log('⚡ AÇÕES EXECUTADAS:', data.actions_needed);
        } else {
            console.log('✅ Todos os campos já existiam');
        }
    }
})
.catch(error => {
    console.error('❌ ERRO:', error);
    
    // Se o script não existir, vamos tentar executar o SQL diretamente
    console.log('🔧 Tentando executar SQL diretamente...');
    
    // Criar um teste simples
    fetch('https://dashlicencas.macip.com.br/app_fortigate.php?id=1', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log('📋 DADOS ATUAIS DO FORTIGATE:', data);
        
        if (data.api_token !== undefined && data.api_ip !== undefined) {
            console.log('✅ Campos API já existem na tabela!');
        } else {
            console.log('❌ Campos API não existem - precisa executar SQL manualmente');
            console.log('📝 Execute no phpMyAdmin:');
            console.log('ALTER TABLE fortigate_devices ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status, ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token;');
        }
    })
    .catch(err => console.error('❌ Erro ao verificar dados:', err));
});