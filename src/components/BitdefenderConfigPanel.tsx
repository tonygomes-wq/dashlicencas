import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface BitdefenderConfig {
  apiKey: string;
  accessUrl: string;
  autoSync: boolean;
  syncInterval: number;
  lastSync: string | null;
  status: 'connected' | 'disconnected' | 'testing';
}

const BitdefenderConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<BitdefenderConfig>({
    apiKey: '',
    accessUrl: 'https://cloud.gravityzone.bitdefender.com/api',
    autoSync: false,
    syncInterval: 6,
    lastSync: null,
    status: 'disconnected'
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Buscar configurações do sistema
      const response = await fetch('/app_bitdefender.php?action=get_config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({
          apiKey: data.api_key || '',
          accessUrl: data.access_url || 'https://cloud.gravityzone.bitdefender.com/api',
          autoSync: data.auto_sync || false,
          syncInterval: data.sync_interval || 6,
          lastSync: data.last_sync || null,
          status: data.api_key ? 'connected' : 'disconnected'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const testConnection = async () => {
    if (!config.apiKey) {
      toast.error('Por favor, insira uma API Key');
      return;
    }

    setTesting(true);
    setConfig(prev => ({ ...prev, status: 'testing' }));
    const toastId = toast.loading('Testando conexão...');

    try {
      const response = await fetch('/app_bitdefender.php?action=test_connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          access_url: config.accessUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        setConfig(prev => ({ ...prev, status: 'connected' }));
        toast.success('Conexão estabelecida com sucesso!', { id: toastId });
      } else {
        setConfig(prev => ({ ...prev, status: 'disconnected' }));
        toast.error(result.error || 'Falha na conexão', { id: toastId });
      }
    } catch (error: any) {
      setConfig(prev => ({ ...prev, status: 'disconnected' }));
      toast.error('Erro ao testar conexão', { id: toastId });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    if (!config.apiKey) {
      toast.error('Por favor, insira uma API Key');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Salvando configuração...');

    try {
      const response = await fetch('/app_bitdefender.php?action=save_config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          access_url: config.accessUrl,
          auto_sync: config.autoSync,
          sync_interval: config.syncInterval
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Configuração salva com sucesso!', { id: toastId });
        
        // Se auto-sync foi ativado, informar sobre o cron job
        if (config.autoSync) {
          toast.success(
            `Sincronização automática ativada! Os dados serão atualizados a cada ${config.syncInterval} hora(s).`,
            { duration: 5000 }
          );
        }
      } else {
        toast.error(result.error || 'Erro ao salvar configuração', { id: toastId });
      }
    } catch (error: any) {
      toast.error('Erro ao salvar configuração', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (config.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'testing':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (config.status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'testing':
        return 'Testando...';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (config.status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'testing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuração da API Bitdefender
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure a integração com o Bitdefender GravityZone
          </p>
        </div>
      </div>

      {/* API Key */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          API Key
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="Digite sua API Key do Bitdefender"
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showApiKey ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Obtenha sua API Key em: GravityZone → My Account → API Keys
        </p>
      </div>

      {/* Access URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Access URL
        </label>
        <input
          type="text"
          value={config.accessUrl}
          onChange={(e) => setConfig({ ...config, accessUrl: e.target.value })}
          placeholder="https://cloud.gravityzone.bitdefender.com/api"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          URL da API do seu Control Center
        </p>
      </div>

      {/* Auto Sync */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoSync"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoSync" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ativar sincronização automática
            </label>
          </div>
        </div>

        {config.autoSync && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intervalo de Sincronização
            </label>
            <select
              value={config.syncInterval}
              onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={3}>3 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Os dados serão sincronizados automaticamente neste intervalo
            </p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </span>
            {getStatusIcon()}
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {config.lastSync && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Última sincronização:
              </p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {new Date(config.lastSync).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={testConnection}
          disabled={testing || !config.apiKey}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:text-gray-400 rounded-lg transition-colors"
        >
          {testing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Testando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Testar Conexão</span>
            </>
          )}
        </button>

        <button
          onClick={saveConfig}
          disabled={saving || !config.apiKey}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span>Salvar Configuração</span>
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Como obter sua API Key:
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Acesse o Bitdefender GravityZone</li>
          <li>Clique no ícone do usuário → My Account</li>
          <li>Vá em "API keys" → "Add"</li>
          <li>Selecione as APIs: Licensing, Companies</li>
          <li>Clique em "Generate" e copie a chave</li>
        </ol>
      </div>
    </div>
  );
};

export default BitdefenderConfigPanel;
