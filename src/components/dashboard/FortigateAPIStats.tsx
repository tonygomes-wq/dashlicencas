import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface APIStats {
  devices_with_api: number;
  synced_last_hour: number;
  unresolved_alerts: number;
  critical_alerts: number;
  licenses_expiring_30_days: number;
}

interface FortigateAPIStatsProps {
  onSyncAll?: () => void;
}

const FortigateAPIStats: React.FC<FortigateAPIStatsProps> = ({ onSyncAll }) => {
  const [stats, setStats] = useState<APIStats>({
    devices_with_api: 0,
    synced_last_hour: 0,
    unresolved_alerts: 0,
    critical_alerts: 0,
    licenses_expiring_30_days: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.fortigateAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);

    try {
      const result = await apiClient.fortigateAPI.syncAll();
      
      if (result.success) {
        toast.success(`${result.successful} de ${result.total} dispositivos sincronizados`);
        loadStats();
        if (onSyncAll) onSyncAll();
      } else {
        toast.error('Erro ao sincronizar dispositivos');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">FortiGate API</h3>
              <p className="text-orange-100 text-sm">Sincronização Automática</p>
            </div>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || stats.devices_with_api === 0}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Todos'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Dispositivos com API */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.devices_with_api}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dispositivos Configurados
            </p>
          </div>

          {/* Sincronizados Recentemente */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.synced_last_hour}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sincronizados (1h)
            </p>
          </div>

          {/* Alertas Não Resolvidos */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.unresolved_alerts}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alertas Pendentes
            </p>
          </div>

          {/* Alertas Críticos */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.critical_alerts}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alertas Críticos
            </p>
          </div>

          {/* Licenças Expirando */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.licenses_expiring_30_days}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Licenças Expirando (30d)
            </p>
          </div>

          {/* Status Geral */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className={`w-5 h-5 ${
                stats.critical_alerts === 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
              <span className={`text-2xl font-bold ${
                stats.critical_alerts === 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.critical_alerts === 0 ? 'OK' : 'ATENÇÃO'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Status Geral
            </p>
          </div>
        </div>

        {/* Info Message */}
        {stats.devices_with_api === 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Dica:</strong> Configure a API FortiGate nos dispositivos para habilitar sincronização automática de licenças e alertas.
            </p>
          </div>
        )}

        {/* Critical Alerts Warning */}
        {stats.critical_alerts > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Existem {stats.critical_alerts} alerta(s) crítico(s) que requerem atenção imediata!
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Verifique a página de FortiGate para mais detalhes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FortigateAPIStats;
