import React, { useState, useEffect } from 'react';
import { Monitor, Laptop, Server, Shield, AlertTriangle, WifiOff, RefreshCw, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Endpoint {
  id: number;
  client_id: number;
  client_name: string;
  endpoint_id: string;
  name: string;
  ip_address: string | null;
  mac_address: string | null;
  operating_system: string | null;
  os_version: string | null;
  agent_version: string | null;
  protection_status: 'protected' | 'at_risk' | 'offline';
  last_seen: string | null;
  is_managed: boolean;
  hardware_id: number | null;
  hardware_name: string | null;
  last_sync: string | null;
}

interface BitdefenderEndpointsTableProps {
  clientId?: number;
}

const BitdefenderEndpointsTable: React.FC<BitdefenderEndpointsTableProps> = ({ clientId }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'protected' | 'at_risk' | 'offline'>('all');

  useEffect(() => {
    loadEndpoints();
  }, [clientId, filter]);

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      
      let url = '/app_bitdefender_endpoints.php?action=list';
      if (clientId) url += `&client_id=${clientId}`;
      if (filter !== 'all') url += `&protection_status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar endpoints');
      
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error('Erro ao carregar endpoints:', error);
      toast.error('Erro ao carregar endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading('Sincronizando endpoints...');
    
    try {
      const url = clientId
        ? '/app_bitdefender_endpoints.php'
        : '/app_bitdefender_endpoints.php?action=sync';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: clientId ? JSON.stringify({ client_id: clientId }) : undefined
      });
      
      if (!response.ok) throw new Error('Erro na sincronização');
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(
          clientId 
            ? `${result.processed || 0} endpoints sincronizados`
            : `${result.total_clients || 0} clientes processados`,
          { id: toastId }
        );
        await loadEndpoints();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'protected':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'at_risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-gray-400" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      protected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      at_risk: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      offline: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    const labels = {
      protected: 'Protegido',
      at_risk: 'Em Risco',
      offline: 'Offline'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const filteredEndpoints = endpoints;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Endpoints Bitdefender
          </h2>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({endpoints.length})
          </button>
          <button
            onClick={() => setFilter('protected')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'protected'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Protegidos
          </button>
          <button
            onClick={() => setFilter('at_risk')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'at_risk'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Em Risco
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'offline'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Offline
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando endpoints...</p>
          </div>
        ) : filteredEndpoints.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum endpoint encontrado
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Clique em "Sincronizar" para buscar endpoints
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sistema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Última Conexão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEndpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(endpoint.protection_status)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {endpoint.name}
                        </div>
                        {endpoint.ip_address && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {endpoint.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {endpoint.client_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {endpoint.operating_system || 'N/A'}
                    </div>
                    {endpoint.agent_version && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Agent: {endpoint.agent_version}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(endpoint.protection_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatLastSeen(endpoint.last_seen)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {endpoint.hardware_id ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Vinculado
                      </span>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Vincular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BitdefenderEndpointsTable;
