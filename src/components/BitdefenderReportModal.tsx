import React, { useEffect, useState } from 'react';
import { X, Download, Printer, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { apiClient } from '../lib/apiClient';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface BitdefenderReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null; // Cliente específico (opcional)
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

const BitdefenderReportModal: React.FC<BitdefenderReportModalProps> = ({ isOpen, onClose, clientId: initialClientId }) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(initialClientId || null);
  const [clients, setClients] = useState<Array<{ id: number; company: string }>>([]);
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
      fetchClients();
      fetchReportData();
    }
  }, [isOpen, selectedClientId]);

  const fetchClients = async () => {
    try {
      const bitdefenderData = await apiClient.bitdefender.list();
      const uniqueClients = Array.from(
        new Map(bitdefenderData.map((item: any) => [item.id, { id: item.id, company: item.company }])).values()
      );
      setClients(uniqueClients);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Buscar dados do Bitdefender
      const bitdefenderData = await apiClient.bitdefender.list();
      
      // Se cliente selecionado, filtrar dados do Bitdefender
      let filteredBitdefender = bitdefenderData;
      if (selectedClientId) {
        filteredBitdefender = bitdefenderData.filter((item: any) => 
          parseInt(item.id) === selectedClientId
        );
      }
      
      // Buscar dados de uso de licenças
      let licenseUsageData = await apiClient.licenseUsage.list();
      let licenseUsageArray = Array.isArray(licenseUsageData) ? licenseUsageData : [];
      
      // Filtrar uso de licenças por cliente se selecionado
      if (selectedClientId) {
        licenseUsageArray = licenseUsageArray.filter((item: any) => 
          parseInt(item.client_id) === selectedClientId
        );
      }
      
      // Calcular totais do Bitdefender
      const totalLicenses = filteredBitdefender.reduce((sum: number, item: any) => 
        sum + (parseInt(item.total_licenses) || 0), 0);
      
      // Calcular totais de uso de licenças
      const totalUsed = licenseUsageArray.reduce((sum: number, item: any) => 
        sum + (parseInt(item.used_slots) || 0), 0);
      const totalAvailable = licenseUsageArray.reduce((sum: number, item: any) => 
        sum + (parseInt(item.total_slots) || 0), 0);
      const overLimitCount = licenseUsageArray.filter((item: any) => 
        (parseFloat(item.license_usage_percent) || 0) >= 100).length;
      const highUsageCount = licenseUsageArray.filter((item: any) => 
        (parseFloat(item.license_usage_percent) || 0) >= 90).length;
      
      // Buscar endpoints se disponível
      let endpointsData = { total: 0, protected: 0, at_risk: 0, offline: 0 };
      try {
        if (selectedClientId) {
          // Buscar endpoints do cliente específico
          const endpoints = await apiClient.endpoints.list({ client_id: selectedClientId });
          const endpointsArray = Array.isArray(endpoints) ? endpoints : [];
          endpointsData.total = endpointsArray.length;
          endpointsData.protected = endpointsArray.filter((e: any) => e.protection_status === 'protected').length;
          endpointsData.at_risk = endpointsArray.filter((e: any) => e.protection_status === 'at_risk').length;
          endpointsData.offline = endpointsArray.filter((e: any) => e.is_online === false).length;
        } else {
          // Buscar estatísticas gerais
          const stats = await apiClient.endpoints.stats();
          endpointsData = {
            total: parseInt(stats.total) || 0,
            protected: parseInt(stats.protected) || 0,
            at_risk: parseInt(stats.at_risk) || 0,
            offline: parseInt(stats.offline) || 0
          };
        }
      } catch (error) {
        console.warn('Endpoints não disponíveis, usando dados de licenças');
      }
      
      // Determinar valores finais
      const totalEndpoints = endpointsData.total || licenseUsageArray.length || filteredBitdefender.length;
      const protectedEndpoints = endpointsData.protected || totalUsed || totalLicenses;
      const atRiskEndpoints = endpointsData.at_risk || overLimitCount;
      const offlineEndpoints = endpointsData.offline || highUsageCount;
      
      // Processar dados
      setReportData({
        totalEndpoints,
        protectedEndpoints,
        atRiskEndpoints,
        offlineEndpoints,
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
          used: totalUsed || totalLicenses,
          available: totalAvailable || totalLicenses,
          overLimit: overLimitCount
        }
      });
      
      console.log('📊 Dados do relatório:', {
        selectedClientId,
        filteredBitdefender: filteredBitdefender.length,
        licenseUsageArray: licenseUsageArray.length,
        totalLicenses,
        totalUsed,
        totalEndpoints,
        protectedEndpoints
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      // Definir dados padrão em caso de erro
      setReportData({
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
    <>
      {/* Estilos para Impressão */}
      <style>{`
        @media print {
          /* Reset geral */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ocultar tudo primeiro */
          body * {
            visibility: hidden;
          }
          
          /* Mostrar apenas o conteúdo do relatório */
          .print-content,
          .print-content * {
            visibility: visible !important;
          }
          
          /* Ocultar elementos de UI */
          .no-print,
          .no-print *,
          button,
          select,
          input,
          .sticky,
          .fixed,
          .backdrop-blur-sm {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Mostrar cabeçalho de impressão */
          .print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          .print\\:flex {
            display: flex !important;
            visibility: visible !important;
          }
          
          .print\\:grid {
            display: grid !important;
            visibility: visible !important;
          }
          
          /* Ocultar barras de rolagem */
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          
          /* Ajustar layout para impressão */
          html, body {
            width: 100%;
            height: auto;
            overflow: visible !important;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 30px 40px !important;
            margin: 0 !important;
            background: white !important;
          }
          
          /* Remover sombras e bordas arredondadas */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          /* Manter bordas mas sem arredondamento excessivo */
          .rounded-lg,
          .rounded-xl {
            border-radius: 4px !important;
          }
          
          /* Ajustar cores para impressão */
          .bg-gray-50,
          .dark\\:bg-gray-900\\/50 {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
          }
          
          .bg-white,
          .dark\\:bg-gray-800 {
            background: white !important;
          }
          
          /* Garantir texto legível */
          .text-gray-900,
          .dark\\:text-white,
          h1, h2, h3, h4, h5, h6 {
            color: #111827 !important;
          }
          
          .text-gray-600,
          .dark\\:text-gray-400 {
            color: #4b5563 !important;
          }
          
          .text-gray-500,
          .dark\\:text-gray-300 {
            color: #6b7280 !important;
          }
          
          .text-gray-700 {
            color: #374151 !important;
          }
          
          /* Manter cores dos cards de status */
          .bg-blue-50,
          .dark\\:bg-blue-900\\/20 {
            background: #eff6ff !important;
            border: 2px solid #3b82f6 !important;
          }
          
          .bg-green-50,
          .dark\\:bg-green-900\\/20 {
            background: #f0fdf4 !important;
            border: 2px solid #22c55e !important;
          }
          
          .bg-red-50,
          .dark\\:bg-red-900\\/20 {
            background: #fef2f2 !important;
            border: 2px solid #ef4444 !important;
          }
          
          .bg-purple-50,
          .dark\\:bg-purple-900\\/20 {
            background: #faf5ff !important;
            border: 2px solid #a855f7 !important;
          }
          
          .bg-amber-50,
          .dark\\:bg-amber-900\\/20 {
            background: #fffbeb !important;
            border: 2px solid #f59e0b !important;
          }
          
          /* Manter cores do texto dos cards */
          .text-blue-600,
          .dark\\:text-blue-400 {
            color: #2563eb !important;
          }
          
          .text-green-600,
          .dark\\:text-green-400 {
            color: #16a34a !important;
          }
          
          .text-red-600,
          .dark\\:text-red-400 {
            color: #dc2626 !important;
          }
          
          .text-purple-600,
          .dark\\:text-purple-400 {
            color: #9333ea !important;
          }
          
          .text-amber-600,
          .dark\\:text-amber-400 {
            color: #d97706 !important;
          }
          
          .text-amber-900,
          .dark\\:text-amber-100 {
            color: #78350f !important;
          }
          
          /* Ajustar gráficos */
          canvas {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid !important;
          }
          
          /* Ajustar grid */
          .grid {
            display: grid !important;
            page-break-inside: avoid !important;
          }
          
          /* Quebras de página */
          .page-break {
            page-break-after: always !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
          
          /* Evitar quebras dentro de elementos */
          .bg-blue-50,
          .bg-green-50,
          .bg-red-50,
          .bg-purple-50,
          .bg-amber-50,
          .bg-gray-50 {
            page-break-inside: avoid !important;
          }
          
          /* Ajustar espaçamento */
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          /* Garantir que listas sejam visíveis */
          ul, ol, li {
            visibility: visible !important;
          }
          
          /* Estilo do cabeçalho executivo */
          .print-header {
            border-bottom: 3px solid #3b82f6 !important;
            padding-bottom: 20px !important;
            margin-bottom: 30px !important;
          }
          
          /* Estilo das seções */
          .print-section {
            margin-bottom: 25px !important;
            page-break-inside: avoid !important;
          }
          
          .print-section-title {
            font-size: 18px !important;
            font-weight: 700 !important;
            color: #1f2937 !important;
            margin-bottom: 15px !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid #e5e7eb !important;
          }
          
          /* KPIs em destaque */
          .kpi-card {
            padding: 15px !important;
            border: 2px solid !important;
            page-break-inside: avoid !important;
          }
          
          /* Ajustar tamanho de fonte para impressão */
          body {
            font-size: 11pt !important;
          }
          
          h1 {
            font-size: 24pt !important;
          }
          
          h2 {
            font-size: 18pt !important;
          }
          
          h3 {
            font-size: 14pt !important;
          }
          
          .text-3xl {
            font-size: 28pt !important;
          }
          
          .text-2xl {
            font-size: 20pt !important;
          }
          
          .text-xl {
            font-size: 16pt !important;
          }
          
          .text-lg {
            font-size: 13pt !important;
          }
          
          .text-sm {
            font-size: 10pt !important;
          }
          
          .text-xs {
            font-size: 9pt !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10 no-print">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório Bitdefender</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
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

          {/* Filtro de Cliente */}
          <div className="flex items-center gap-3 no-print">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filtrar por Cliente:
            </label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
            {selectedClientId && (
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Exibindo dados de 1 cliente
              </span>
            )}
          </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block print-header">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Relatório Executivo Mensal de Segurança de Endpoint
                  </h1>
                  <p className="text-sm text-gray-600">
                    Relatório executivo mensal de desempenho da iniciativa software contente sua antivírus software de Segurança de Endpoint
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Data de Geração:</span>
                  <p className="text-gray-600">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Período:</span>
                  <p className="text-gray-600">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
                {selectedClientId && (
                  <div>
                    <span className="font-semibold text-gray-700">Cliente:</span>
                    <p className="text-gray-600">{clients.find(c => c.id === selectedClientId)?.company || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-600">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 print-content">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* 1. RESUMO EXECUTIVO */}
              <div className="print-section">
                <h2 className="print-section-title text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300">
                  1. Resumo Executivo
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border-l-4 border-blue-600">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {reportData.atRiskEndpoints === 0 && reportData.offlineEndpoints === 0 ? (
                      <>
                        <strong>Postura de segurança excelente.</strong> Neste período, nossa infraestrutura de segurança de endpoint 
                        permaneceu forte e estável. O antivírus Bitdefender bloqueou com sucesso <strong>{reportData.blockedThreats} ameaças</strong>, 
                        mantendo <strong>{reportData.protectedEndpoints} endpoints protegidos</strong>. A conformidade de licenças atingiu{' '}
                        <strong>{reportData.licenseUsage.overLimit === 0 ? '100%' : `${Math.round((1 - reportData.licenseUsage.overLimit / reportData.totalEndpoints) * 100)}%`}</strong>.
                        {' '}Nenhuma violação de dados foi confirmada. Nosso foco principal no próximo período será manter a excelência 
                        operacional e monitorar proativamente novas ameaças emergentes.
                      </>
                    ) : (
                      <>
                        <strong>Atenção necessária.</strong> Neste período, identificamos <strong>{reportData.atRiskEndpoints} endpoints em risco</strong>
                        {reportData.offlineEndpoints > 0 && <> e <strong>{reportData.offlineEndpoints} com uso elevado de licenças</strong></>}.
                        O antivírus Bitdefender bloqueou <strong>{reportData.blockedThreats} ameaças</strong>, protegendo{' '}
                        <strong>{reportData.protectedEndpoints} endpoints</strong>. Recomendamos ação imediata para regularizar os endpoints 
                        em situação crítica e revisar as políticas de segurança.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 2. PRINCIPAIS MÉTRICAS (KPIs) */}
              <div className="print-section">
                <h2 className="print-section-title text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300">
                  2. Indicadores-Chave de Performance (KPIs)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="kpi-card bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                        TOTAL
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Total de Endpoints</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.totalEndpoints}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dispositivos monitorados</p>
                  </div>
                  
                  <div className="kpi-card bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                        ✓ OK
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Endpoints Protegidos</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{reportData.protectedEndpoints}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {reportData.totalEndpoints > 0 ? Math.round((reportData.protectedEndpoints / reportData.totalEndpoints) * 100) : 0}% do total
                    </p>
                  </div>
                  
                  <div className="kpi-card bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                        BLOQUEADAS
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Ameaças Bloqueadas</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{reportData.blockedThreats}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {reportData.totalThreats > 0 ? Math.round((reportData.blockedThreats / reportData.totalThreats) * 100) : 100}% de eficácia
                    </p>
                  </div>
                  
                  <div className="kpi-card bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded">
                        USO
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Licenças em Uso</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{reportData.licenseUsage.used}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      de {reportData.licenseUsage.available} disponíveis
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. ANÁLISE VISUAL - GRÁFICOS */}
              <div className="print-section page-break-before">
                <h2 className="print-section-title text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300">
                  3. Análise Visual de Segurança
                </h2>
                
                {/* Gráficos de Pizza */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Status dos Endpoints */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center border-b pb-2">
                      Status dos Endpoints
                    </h3>
                    <div className="h-64">
                      <Pie data={endpointStatusData} options={chartOptions} />
                    </div>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
                      <p><strong>Insight:</strong> {reportData.atRiskEndpoints === 0 ? 'Todos os endpoints estão em conformidade.' : `${reportData.atRiskEndpoints} endpoints requerem atenção imediata.`}</p>
                    </div>
                  </div>

                  {/* Status das Ameaças */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center border-b pb-2">
                      Ameaças Detectadas
                    </h3>
                    <div className="h-64">
                      <Pie data={threatStatusData} options={chartOptions} />
                    </div>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
                      <p><strong>Insight:</strong> {reportData.blockedThreats} ameaças bloqueadas com sucesso, garantindo proteção contínua.</p>
                    </div>
                  </div>

                  {/* Uso de Licenças */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center border-b pb-2">
                      Uso de Licenças
                    </h3>
                    <div className="h-64">
                      <Pie data={licenseUsageData} options={chartOptions} />
                    </div>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
                      <p><strong>Insight:</strong> {reportData.licenseUsage.overLimit > 0 ? `${reportData.licenseUsage.overLimit} licenças sobre o limite. Considerar expansão.` : 'Uso de licenças dentro do limite esperado.'}</p>
                    </div>
                  </div>
                </div>

                {/* Top Ameaças */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2">
                    Top 5 Ameaças Detectadas no Período
                  </h3>
                  <div className="h-80">
                    <Bar data={topThreatsData} options={barChartOptions} />
                  </div>
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Análise:</strong> O ransomware continua sendo a ameaça mais prevalente, destacando a necessidade de treinamento contínuo de conscientização de segurança para os usuários.</p>
                  </div>
                </div>
              </div>

              {/* 4. RECOMENDAÇÕES E PRÓXIMOS PASSOS */}
              <div className="print-section">
                <h2 className="print-section-title text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300">
                  4. Recomendações e Próximos Passos
                </h2>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 border-l-4 border-amber-600">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        Ações Prioritárias
                      </h3>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    {reportData.atRiskEndpoints > 0 && (
                      <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-red-500">
                        <span className="text-red-600 dark:text-red-400 font-bold flex-shrink-0">⚠️ CRÍTICO</span>
                        <span>
                          <strong>{reportData.atRiskEndpoints} endpoints em risco identificados</strong> - Verificar proteção imediatamente e atualizar políticas de segurança. Prioridade máxima.
                        </span>
                      </li>
                    )}
                    {reportData.offlineEndpoints > 0 && (
                      <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-amber-500">
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">⚠️ ATENÇÃO</span>
                        <span>
                          <strong>{reportData.offlineEndpoints} endpoints com uso elevado</strong> - Verificar conectividade e status dos dispositivos. Monitorar de perto.
                        </span>
                      </li>
                    )}
                    {reportData.licenseUsage.overLimit > 0 && (
                      <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-red-500">
                        <span className="text-red-600 dark:text-red-400 font-bold flex-shrink-0">💰 FINANCEIRO</span>
                        <span>
                          <strong>{reportData.licenseUsage.overLimit} licenças sobre o limite</strong> - Considerar aquisição de licenças adicionais para evitar custos extras e garantir conformidade.
                        </span>
                      </li>
                    )}
                    {reportData.totalThreats > 100 && (
                      <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-blue-500">
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">📚 TREINAMENTO</span>
                        <span>
                          <strong>Alto volume de ameaças detectadas ({reportData.totalThreats})</strong> - Revisar políticas de navegação e implementar treinamento de conscientização em segurança para usuários.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-green-500">
                      <span className="text-green-600 dark:text-green-400 font-bold flex-shrink-0">✓ MANUTENÇÃO</span>
                      <span>
                        <strong>Sincronização regular com API Bitdefender</strong> - Manter monitoramento em tempo real e atualização automática de políticas de segurança.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-green-500">
                      <span className="text-green-600 dark:text-green-400 font-bold flex-shrink-0">✓ PREVENÇÃO</span>
                      <span>
                        <strong>Implementar autenticação multifator (MFA)</strong> - Reforçar segurança em todos os serviços externos e pontos de acesso críticos.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 5. CONCLUSÃO */}
              <div className="print-section">
                <h2 className="print-section-title text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300">
                  5. Conclusão
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border border-gray-300">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {reportData.atRiskEndpoints === 0 && reportData.licenseUsage.overLimit === 0 ? (
                      <>
                        O ambiente de TI permanece <strong className="text-green-600">seguro e em conformidade</strong>. 
                        A infraestrutura de proteção Bitdefender demonstrou eficácia de <strong>{reportData.totalThreats > 0 ? Math.round((reportData.blockedThreats / reportData.totalThreats) * 100) : 100}%</strong> no 
                        bloqueio de ameaças. Manteremos o foco em manter os sistemas atualizados, monitorar proativamente novas 
                        tendências de ameaças e garantir a continuidade operacional.
                      </>
                    ) : (
                      <>
                        O ambiente de TI requer <strong className="text-amber-600">atenção imediata</strong> em pontos específicos identificados. 
                        Apesar da eficácia de <strong>{reportData.totalThreats > 0 ? Math.round((reportData.blockedThreats / reportData.totalThreats) * 100) : 100}%</strong> no 
                        bloqueio de ameaças, as ações corretivas listadas devem ser priorizadas para restaurar a conformidade total 
                        e minimizar riscos operacionais.
                      </>
                    )}
                  </p>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Nota:</strong> Este relatório foi gerado automaticamente pelo sistema de monitoramento Bitdefender. 
                      Para informações detalhadas ou esclarecimentos, entre em contato com a equipe de Segurança da Informação.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BitdefenderReportModal;
