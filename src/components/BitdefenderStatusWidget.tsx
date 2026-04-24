import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';

interface BitdefenderStats {
  totalLicenses: number;
  usedLicenses: number;
  daysUntilExpiry: number;
  totalEndpoints: number;
  protectedEndpoints: number;
  atRiskEndpoints: number;
  offlineEndpoints: number;
  threatsLast24h: number;
  lastSync: string | null;
}

interface BitdefenderStatusWidgetProps {
  onViewDetails?: () => void;
}

const BitdefenderStatusWidget: React.FC<BitdefenderStatusWidgetProps> = ({ onViewDetails }) => {
  const [stats, setStats] = useState<BitdefenderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas de licenças
      const licenses = await apiClient.bitdefender.list();
      
      // Buscar estatísticas de endpoints
      const endpointsResponse = await fetch('/app_bitdefender_endpoints.php?action=stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const endpointsData = await endpointsResponse.json();
      
      // Calcular estatísticas
      const totalLicenses = licenses.reduce((sum: number, l: any) => sum + (l.totalLicenses || 0), 0);
      const usedLicenses = endpointsData.total || 0;
      
      // Encontrar a licença que vence mais cedo
      const sortedByExpiry = licenses
        .filter((l: any) => l.expirationDate)
        .sort((a: any, b: any) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
      
      const nextExpiry = sortedByExpiry[0];
      const daysUntilExpiry = nextExpiry 
        ? Math.ceil((new Date(nextExpiry.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      
      setStats({
        totalLicenses,
        usedLicenses,
        daysUntilExpiry,
        totalEndpoints: endpointsData.total || 0,
        protectedEndpoints: endpointsData.protected || 0,
        atRiskEndpoints: endpointsData.at_risk || 0,
        offlineEndpoints: endpointsData.offline || 0,
        threatsLast24h: 0, // TODO: Implementar quando API Bitdefender retornar
        lastSync: null
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas do Bitdefender');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading('Sincronizando com Bitdefender...');
    
    try {
      // Sincronizar endpoints
      const response = await fetch('/app_bitdefender_endpoints.php?action=sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro na sincronização');
      
      const result = await response.json();
      
      toast.success(`Sincronizado! ${result.total_clients || 0} clientes processados`, { id: toastId });
      
      // Recarregar estatísticas
      await loadStats();
    } catch (error) {
      toast.error('Erro ao sincronizar', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bitdefender Status
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bitdefender Status
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  const licenseUsagePercent = stats.totalLicenses > 0 
    ? Math.round((stats.usedLicenses / stats.totalLicenses) * 100) 
    : 0;
  
  const protectionPercent = stats.totalEndpoints > 0
    ? Math.round((stats.protectedEndpoints / stats.totalEndpoints) * 100)
    : 0;

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProtectionColor = (percent: number) => {
    if (percent >= 95) return 'text-green-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bitdefender Status
          </h3>
        </div>
        {stats.lastSync && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Atualizado: {new Date(stats.lastSync).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {/* Licenças */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Licenças
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {stats.usedLicenses}/{stats.totalLicenses} em uso ({licenseUsagePercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              licenseUsagePercent >= 90 ? 'bg-red-600' :
              licenseUsagePercent >= 75 ? 'bg-yellow-600' :
              'bg-green-600'
            }`}
            style={{ width: `${Math.min(licenseUsagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Expiração */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Expira em:
          </span>
          <span className={`text-sm font-semibold ${getExpiryColor(stats.daysUntilExpiry)}`}>
            {stats.daysUntilExpiry > 0 
              ? `${stats.daysUntilExpiry} dias`
              : stats.daysUntilExpiry === 0
              ? 'Hoje!'
              : 'Vencido'}
          </span>
        </div>
      </div>

      {/* Dispositivos Protegidos */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dispositivos Protegidos
          </span>
          <span className={`text-sm font-semibold ${getProtectionColor(protectionPercent)}`}>
            {stats.protectedEndpoints}/{stats.totalEndpoints} ({protectionPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              protectionPercent >= 95 ? 'bg-green-600' :
              protectionPercent >= 80 ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${Math.min(protectionPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Alertas */}
      {stats.atRiskEndpoints > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              {stats.atRiskEndpoints} dispositivo{stats.atRiskEndpoints > 1 ? 's' : ''} em risco
            </span>
          </div>
        </div>
      )}

      {stats.offlineEndpoints > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {stats.offlineEndpoints} dispositivo{stats.offlineEndpoints > 1 ? 's' : ''} offline
            </span>
          </div>
        </div>
      )}

      {/* Ameaças (quando implementado) */}
      {stats.threatsLast24h > 0 && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-300">
              {stats.threatsLast24h} ameaça{stats.threatsLast24h > 1 ? 's' : ''} bloqueada{stats.threatsLast24h > 1 ? 's' : ''} (24h)
            </span>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </span>
        </button>
        
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Detalhes</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BitdefenderStatusWidget;
