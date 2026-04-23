// SCRIPT PARA EXECUTAR NO CONSOLE DO NAVEGADOR
// Abra o console (F12) e cole este código

console.log('🔧 Corrigindo permissões...');

fetch('/fix_admin_permissions.php')
  .then(response => response.json())
  .then(data => {
    console.log('✅ SUCESSO!', data);
    console.log('');
    console.log('📋 Resultado:');
    console.log('  - Usuários com role admin:', data.admin_count);
    console.log('  - Permissões atualizadas:', data.permissions_updated);
    console.log('');
    console.log('👥 Usuários atualizados:');
    data.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}) - Role: ${user.role}`);
    });
    console.log('');
    console.log('🎉 PRÓXIMOS PASSOS:');
    console.log('  1. Fazer logout');
    console.log('  2. Limpar cache (Ctrl+Shift+Delete)');
    console.log('  3. Fazer login novamente');
    console.log('  4. Sistema deve funcionar sem erros 403!');
  })
  .catch(error => {
    console.error('❌ ERRO:', error);
    console.log('');
    console.log('💡 ALTERNATIVA:');
    console.log('Execute direto no MySQL:');
    console.log('');
    console.log("UPDATE users SET role = 'admin';");
    console.log("UPDATE users SET permissions = '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"actions\":{\"edit\":true,\"delete\":true},\"client_access_all\":true}';");
  });
