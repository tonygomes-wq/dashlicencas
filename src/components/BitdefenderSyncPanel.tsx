import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BitdefenderSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SyncConfig {
  api_key: string;
  access_url: string;
  enabled: boolean;
  sync_interval: number;
  last_sync: string | null;
}

interface SyncLog {
  id: number;
  status: 'success' | 'error' | 'warning';
  message: string;
  created_at: string;
}

const BitdefenderSyncPanel: React.FC<BitdefenderSyncPanelProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SyncConfig>({
    api_key: '',
    access_url: 'https://cloud.gravityzone.bitdefender.com/api',
    enabled: false,
    sync_interval: 3600,
    last_sync: null
  });
  
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      loadLogs();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/app_bitdefender_sync.php?action=config');
      const data = await response.json();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/app_bitdefender_sync.php?action=logs');
      const data = await response.json();
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const handleSaveConfig = async () => {
    const toastId = toast.loading('Salvando configuração...');
    try {
      const response = await fetch('/app_bitdefender_sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'config', ...config })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Configuração salva com sucesso!', { id: toastId });
        loadConfig();
      } else {
        toast.error(result.error || 'Erro ao salvar', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar', { id: toastId });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const toastId = toast.loading('Testando conexão...');
    
    try {
      const response = await fetch('/app_bitdefender_sync.php?action=test');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Conexão estabelecida com sucesso!', { id: toastId });
      } else {
        toast.error(result.message || 'Falha na conexão', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao testar', { id: toastId });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando com Bitdefender...');
    
    try {
      const response = await fetch('/app_bitdefender_sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(
          `Sincronização concluída! ${result.updated} registro(s) atualizado(s) em ${result.duration}s`,
          { id: toastId, duration: 5000 }
        );
        loadConfig();
        loadLogs();
        // Recarregar a página para atualizar a tabela
        window.location.reload();
      } else {
        toast.error(result.error || 'Erro na sincronização', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na sincronização', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Sincronização Bitdefender
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'config'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Configuração
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key *
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.api_key}
                    onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pr-20"
                    placeholder="Cole sua API Key aqui"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showApiKey ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Obtenha em: GravityZone → My Account → API Keys
                </p>
              </div>

              {/* Access URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access URL *
                </label>
                <input
                  type="text"
                  value={config.access_url}
                  onChange={(e) => setConfig({ ...config, access_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="https://cloud.gravityzone.bitdefender.com/api"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Encontre em: GravityZone → My Account → Control Center API
                </p>
              </div>

              {/* Enabled */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ativar sincronização automática
                </label>
              </div>

              {/* Last Sync */}
              {config.last_sync && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Última sincronização:</strong>{' '}
                    {new Date(config.last_sync).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.api_key || !config.access_url}
                  className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={!config.api_key || !config.access_url}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Nenhum log de sincronização ainda
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{log.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Fechar
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing || !config.enabled}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BitdefenderSyncPanel;
