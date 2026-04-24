import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Download, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface APIStats {
  totalEndpoints: number;
  protectedEndpoints: number;
  threatsBlocked: number;
  updatesAvailable: number;
  complianceRate: number;
  trends: {
    endpoints: number;
    threats: number;
    updates: number;
  };
}

interface ThreatData {
  date: string;
  count: number;
}

const BitdefenderAPIStats: React.FC = () => {
  const [stats, setStats] = useState<APIStats>({
    totalEndpoints: 1234,
    protectedEndpoints: 1222,
    threatsBlocked: 567,
    updatesAvailable: 12,
    complianceRate: 98.5,
    trends: {
      endpoints: 5,
      threats: -12,
      updates: 3
    }
  });

  const [threatHistory, setThreatHistory] = useState<ThreatData[]>([
    { date: '18/04', count: 45 },
    { date: '19/04', count: 52 },
    { date: '20/04', count: 48 },
    { date: '21/04', count: 61 },
    { date: '22/04', count: 73 },
    { date: '23/04', count: 85 },
    { date: '24/04', count: 92 },
  ]);

  const [topThreats] = useState([
    { name: 'Trojan.Generic.KD.12345678', count: 234 },
    { name: 'Malware.AI.4567890123', count: 189 },
    { name: 'Ransomware.Detected', count: 156 },
    { name: 'Adware.Generic', count: 98 },
    { name: 'Spyware.KeyLogger', count: 67 },
  ]);

  const [loading, setLoading] = useState(false);

  // TODO: Fetch real data from API
  useEffect(() => {
    // fetchAPIStats();
  }, []);

  const fetchAPIStats = async () => {
    setLoading(true);
    try {
      // const data = await apiClient.bitdefender.getAPIStats();
      // setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas da API:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxThreatCount = Math.max(...threatHistory.map(t => t.count));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Estatísticas Bitdefender
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dados em tempo real via API
            </p>
          </div>
        </div>
        <button
          onClick={fetchAPIStats}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : '🔄 Atualizar'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Endpoints Protegidos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {stats.trends.endpoints > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endpoints Protegidos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.protectedEndpoints.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.trends.endpoints > 0 ? '+' : ''}{stats.trends.endpoints}% vs ontem
          </p>
        </div>

        {/* Ameaças Bloqueadas */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            {stats.trends.threats < 0 ? (
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ameaças Bloqueadas</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.threatsBlocked.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.trends.threats}% vs ontem
          </p>
        </div>

        {/* Atualizações Pendentes */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-2">
            <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            {stats.trends.updates > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Atualizações Pendentes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.updatesAvailable}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.trends.updates > 0 ? '+' : ''}{stats.trends.updates} novos
          </p>
        </div>

        {/* Compliance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">✓ Conforme</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance Status</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complianceRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Políticas aplicadas
          </p>
        </div>
      </div>

      {/* Threat Chart and Top Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Chart */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            📈 Ameaças Bloqueadas - Últimos 7 Dias
          </h3>
          <div className="relative h-48">
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-full gap-2">
              {threatHistory.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-t relative group">
                    <div 
                      className="w-full bg-blue-600 dark:bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-700 dark:hover:bg-blue-400"
                      style={{ height: `${(data.count / maxThreatCount) * 160}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.count} ameaças
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{data.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Threats */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            🔝 Top 5 Ameaças
          </h3>
          <div className="space-y-3">
            {topThreats.map((threat, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 dark:text-white font-medium truncate" title={threat.name}>
                    {threat.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {threat.count} detecções
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
          🔄 Sincronizar Todos
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
          📊 Gerar Relatório
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
          📧 Enviar Alertas
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
          🔍 Verificar Offline
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
          ⚙️ Configurar Políticas
        </button>
      </div>
    </div>
  );
};

export default BitdefenderAPIStats;
