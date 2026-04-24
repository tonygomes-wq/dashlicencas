import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';
import { X, Check, AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface FortigateAPIConfigProps {
  deviceId: number;
  deviceName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface APIConfig {
  api_enabled: boolean;
  api_ip: string;
  api_port: number;
  verify_ssl: boolean;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'failed' | 'pending' | 'never';
  last_sync_error: string | null;
}

const FortigateAPIConfig: React.FC<FortigateAPIConfigProps> = ({
  deviceId,
  deviceName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [config, setConfig] = useState<APIConfig>({
    api_enabled: false,
    api_ip: '',
    api_port: 443,
    verify_ssl: false,
    sync_interval_minutes: 60,
    last_sync_at: null,
    last_sync_status: 'never',
    last_sync_error: null
  });

  const [apiToken, setApiToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen, deviceId]);

  const loadConfig = async () => {
    try {
      const data = await apiClient.fortigateAPI.getConfig(deviceId);
      if (data.api_enabled) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!config.api_ip || !apiToken) {
      toast.error('Preencha IP e Token antes de testar');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Salvar temporariamente para testar
      await apiClient.fortigateAPI.saveConfig({
        device_id: deviceId,
        api_ip: config.api_ip,
        api_token: apiToken,
        api_port: config.api_port,
        verify_ssl: config.verify_ssl,
        sync_interval: config.sync_interval_minutes
      });

      const result = await apiClient.fortigateAPI.testConnection(deviceId);
      setTestResult(result);

      if (result.success) {
        toast.success('Conexão estabelecida com sucesso!');
      } else {
        toast.error(`Falha na conexão: ${result.message}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao testar conexão';
      setTestResult({ success: false, message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!config.api_ip || !apiToken) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.fortigateAPI.saveConfig({
        device_id: deviceId,
        api_ip: config.api_ip,
        api_token: apiToken,
        api_port: config.api_port,
        verify_ssl: config.verify_ssl,
        sync_interval: config.sync_interval_minutes
      });

      toast.success('Configuração salva com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);

    try {
      const result = await apiClient.fortigateAPI.syncDevice(deviceId);
      
      if (result.success) {
        toast.success(`Sincronização concluída em ${result.duration}s`);
        loadConfig(); // Recarregar para atualizar última sincronização
        if (onSuccess) onSuccess();
      } else {
        toast.error(`Erro na sincronização: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!confirm('Tem certeza que deseja remover a configuração da API?')) {
      return;
    }

    try {
      await apiClient.fortigateAPI.deleteConfig(deviceId);
      toast.success('Configuração removida com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover configuração');
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Sucesso</span>,
      failed: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Falha</span>,
      pending: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>,
      never: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Nunca</span>
    };
    return badges[status as keyof typeof badges] || badges.never;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuração API FortiGate
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {deviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status da Última Sincronização */}
          {config.api_enabled && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Status da Sincronização
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Última Sincronização</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatLastSync(config.last_sync_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">{getStatusBadge(config.last_sync_status)}</div>
                </div>
              </div>
              {config.last_sync_error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-400">{config.last_sync_error}</p>
                </div>
              )}
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IP do FortiGate *
              </label>
              <input
                type="text"
                value={config.api_ip}
                onChange={(e) => setConfig({ ...config, api_ip: e.target.value })}
                placeholder="192.168.1.99"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Token de API *
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Digite o token de API"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O token será criptografado antes de ser armazenado
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Porta
                </label>
                <input
                  type="number"
                  value={config.api_port}
                  onChange={(e) => setConfig({ ...config, api_port: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalo de Sincronização (min)
                </label>
                <input
                  type="number"
                  value={config.sync_interval_minutes}
                  onChange={(e) => setConfig({ ...config, sync_interval_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="verify_ssl"
                checked={config.verify_ssl}
                onChange={(e) => setConfig({ ...config, verify_ssl: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="verify_ssl" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Verificar certificado SSL
              </label>
            </div>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    testResult.success 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            {config.api_enabled && (
              <>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
                <button
                  onClick={handleDeleteConfig}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remover Config
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FortigateAPIConfig;
