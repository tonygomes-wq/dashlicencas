import app from './app';
import { config, validateConfig } from './config/env';
import { testConnection } from './config/database';

async function startServer() {
  try {
    // Validar configurações
    console.log('🔍 Validando configurações...');
    validateConfig();

    // Testar conexão com banco de dados
    console.log('🔌 Testando conexão com banco de dados...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Falha ao conectar com banco de dados');
    }

    // Iniciar servidor
    const port = config.port;
    app.listen(port, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🚀 Servidor rodando na porta ${port}`);
      console.log(`🚀 Ambiente: ${config.nodeEnv}`);
      console.log(`🚀 API: http://localhost:${port}${config.apiPrefix}`);
      console.log(`🚀 Health: http://localhost:${port}/health`);
      console.log('🚀 ========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();
