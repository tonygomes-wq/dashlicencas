import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import LicenseUsageIndicator from '../LicenseUsageIndicator';

interface LicenseAlert {
  id: number;
  company: string;
  license_key: string;
  used_slots: number;
  total_slots: number;
  license_usage_percent: number;
  free_slots: number;
  over_limit: boolean;
  severity: 'critical' | 'high' | 'medium';
  message: string;
}

const LicenseUsageAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<LicenseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.licenseUsage.alerts();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erro ao carregar alertas de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      // Buscar todos os clientes e sincronizar
      const licenses = await apiClient.bitdefender.list();
      
      for (const license of licenses) {
        if ((license as any).clientApiKey) {
          try {
            await apiClient.licenseUsage.syncClient(license.id);
          } catch (error) {
            console.error(`Erro ao sincronizar cliente ${license.id}:`, error);
          }
        }
      }
      
      // Recarregar alertas
      await loadAlerts();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Alertas de Uso de Licença
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {alerts.length > 0 
                ? `${alerts.length} cliente(s) com uso alto de licenças` 
                : 'Nenhum alerta de uso de licença'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : '🔄 Atualizar'}
          </button>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Todos'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`${getSeverityColor(alert.severity)} border rounded-lg p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {alert.company}
                    </h3>
                    {alert.over_limit && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                        LIMITE EXCEDIDO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4">
                    <LicenseUsageIndicator
                      usedSlots={alert.used_slots}
                      totalSlots={alert.total_slots}
                      usagePercent={alert.license_usage_percent}
                      size="sm"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Chave: {alert.license_key}
                    </span>
                  </div>
                </div>

                {/* Percentage Badge */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`text-3xl font-bold ${
                    alert.over_limit 
                      ? 'text-red-600 dark:text-red-400' 
                      : alert.license_usage_percent >= 90
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {alert.license_usage_percent}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Uso</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40">
              <AlertTriangle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Tudo OK!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nenhum cliente com uso alto de licenças (≥70%)
              </p>
            </div>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </button>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>💡 Dica:</strong> Alertas são gerados automaticamente quando o uso de licenças atinge 70% ou mais. 
          Configure as API Keys dos clientes para sincronização automática.
        </p>
      </div>
    </div>
  );
};

export default LicenseUsageAlerts;
