import React, { useEffect, useState } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { apiClient } from '../lib/apiClient';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface BitdefenderReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  totalEndpoints: number;
  protectedEndpoints: number;
  atRiskEndpoints: number;
  offlineEndpoints: number;
  totalThreats: number;
  blockedThreats: number;
  quarantinedThreats: number;
  topThreats: Array<{ name: string; count: number }>;
  licenseUsage: {
    used: number;
    available: number;
    overLimit: number;
  };
}

const BitdefenderReportModal: React.FC<BitdefenderReportModalProps> = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState<ReportData>({
    totalEndpoints: 0,
    protectedEndpoints: 0,
    atRiskEndpoints: 0,
    offlineEndpoints: 0,
    totalThreats: 0,
    blockedThreats: 0,
    quarantinedThreats: 0,
    topThreats: [],
    licenseUsage: {
      used: 0,
      available: 0,
      overLimit: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchReportData();
    }
  }, [isOpen]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Buscar dados da API
      const stats = await apiClient.endpoints.stats();
      const licenseUsageData = await apiClient.licenseUsage.list();
      
      // Processar dados
      setReportData({
        totalEndpoints: parseInt(stats.total) || 0,
        protectedEndpoints: parseInt(stats.protected) || 0,
        atRiskEndpoints: parseInt(stats.at_risk) || 0,
        offlineEndpoints: parseInt(stats.offline) || 0,
        totalThreats: 455, // Dados de exemplo - substituir por dados reais da API
        blockedThreats: 423,
        quarantinedThreats: 32,
        topThreats: [
          { name: 'Trojan.Generic', count: 234 },
          { name: 'Malware.AI', count: 189 },
          { name: 'Ransomware', count: 156 },
          { name: 'Adware', count: 98 },
          { name: 'Spyware', count: 67 }
        ],
        licenseUsage: {
          used: licenseUsageData.reduce((sum: number, item: any) => sum + (item.used_slots || 0), 0),
          available: licenseUsageData.reduce((sum: number, item: any) => sum + (item.total_slots || 0), 0),
          overLimit: licenseUsageData.filter((item: any) => item.license_usage_percent >= 100).length
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gráfico de Pizza - Status dos Endpoints
  const endpointStatusData = {
    labels: ['Protegidos', 'Em Risco', 'Offline'],
    datasets: [
      {
        data: [reportData.protectedEndpoints, reportData.atRiskEndpoints, reportData.offlineEndpoints],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Verde
          'rgba(239, 68, 68, 0.8)',   // Vermelho
          'rgba(251, 191, 36, 0.8)',  // Amarelo
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Pizza - Ameaças
  const threatStatusData = {
    labels: ['Bloqueadas', 'Em Quarentena'],
    datasets: [
      {
        data: [reportData.blockedThreats, reportData.quarantinedThreats],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(168, 85, 247, 0.8)',  // Roxo
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Pizza - Uso de Licenças
  const licenseUsageData = {
    labels: ['Em Uso', 'Disponíveis', 'Sobre o Limite'],
    datasets: [
      {
        data: [
          reportData.licenseUsage.used,
          reportData.licenseUsage.available - reportData.licenseUsage.used,
          reportData.licenseUsage.overLimit
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(34, 197, 94, 0.8)',   // Verde
          'rgba(239, 68, 68, 0.8)',   // Vermelho
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Barras - Top Ameaças
  const topThreatsData = {
    labels: reportData.topThreats.map(t => t.name),
    datasets: [
      {
        label: 'Detecções',
        data: reportData.topThreats.map(t => t.count),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#6B7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementar download do relatório em PDF
    alert('Funcionalidade de download em desenvolvimento');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório Bitdefender</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Resumo Executivo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Endpoints</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.totalEndpoints}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protegidos</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{reportData.protectedEndpoints}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ameaças Bloqueadas</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{reportData.blockedThreats}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Licenças em Uso</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{reportData.licenseUsage.used}</p>
                </div>
              </div>

              {/* Gráficos de Pizza */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status dos Endpoints */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Status dos Endpoints
                  </h3>
                  <div className="h-64">
                    <Pie data={endpointStatusData} options={chartOptions} />
                  </div>
                </div>

                {/* Status das Ameaças */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Ameaças Detectadas
                  </h3>
                  <div className="h-64">
                    <Pie data={threatStatusData} options={chartOptions} />
                  </div>
                </div>

                {/* Uso de Licenças */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Uso de Licenças
                  </h3>
                  <div className="h-64">
                    <Pie data={licenseUsageData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Top Ameaças */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top 5 Ameaças Detectadas
                </h3>
                <div className="h-80">
                  <Bar data={topThreatsData} options={barChartOptions} />
                </div>
              </div>

              {/* Recomendações */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
                  📋 Recomendações
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {reportData.atRiskEndpoints > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400">⚠️</span>
                      <span>
                        <strong>{reportData.atRiskEndpoints} endpoints em risco</strong> - Verificar proteção e atualizar políticas de segurança
                      </span>
                    </li>
                  )}
                  {reportData.offlineEndpoints > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                      <span>
                        <strong>{reportData.offlineEndpoints} endpoints offline</strong> - Verificar conectividade e status dos dispositivos
                      </span>
                    </li>
                  )}
                  {reportData.licenseUsage.overLimit > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400">⚠️</span>
                      <span>
                        <strong>{reportData.licenseUsage.overLimit} licenças sobre o limite</strong> - Considerar aquisição de licenças adicionais
                      </span>
                    </li>
                  )}
                  {reportData.totalThreats > 100 && (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                      <span>
                        <strong>Alto volume de ameaças detectadas</strong> - Revisar políticas de navegação e treinamento de usuários
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>
                      Manter sincronização regular com a API Bitdefender para monitoramento em tempo real
                    </span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BitdefenderReportModal;
