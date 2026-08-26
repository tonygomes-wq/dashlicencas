import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Trash2, RefreshCw, Calendar, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  report_name: string;
  report_type_name: string;
  status: 'pending' | 'generating' | 'ready' | 'downloaded' | 'failed' | 'expired';
  created_at: string;
  generation_completed_at: string;
  has_pdf: boolean;
  has_csv: boolean;
  pdf_size_kb: number;
  csv_size_kb: number;
  duration_seconds: number;
  error_message: string;
  status_color: string;
}

interface BitdefenderReportsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
}

const BitdefenderReportsListModal: React.FC<BitdefenderReportsListModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ready' | 'failed'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, clientId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = `/app_bitdefender_reports.php?action=list&client_id=${clientId}${filter !== 'all' ? `&status=${filter}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar relatórios');

      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      } else {
        throw new Error(data.error || 'Erro ao carregar relatórios');
      }
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error(error.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (reportId: number, fileType: 'pdf' | 'csv') => {
    const url = `/app_bitdefender_reports.php?action=download&id=${reportId}&type=${fileType}`;
    window.open(url, '_blank');
    toast.success(`Download do ${fileType.toUpperCase()} iniciado`);
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      const response = await fetch(`/app_bitdefender_reports.php?action=delete&type=report&id=${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir relatório');

      const data = await response.json();
      if (data.success) {
        toast.success('Relatório excluído com sucesso');
        fetchReports();
      } else {
        throw new Error(data.error || 'Erro ao excluir relatório');
      }
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error(error.message || 'Erro ao excluir relatório');
    }
  };

  const getStatusBadge = (report: Report) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', icon: Clock },
      generating: { label: 'Gerando', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Loader },
      ready: { label: 'Pronto', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
      downloaded: { label: 'Baixado', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Download },
      failed: { label: 'Falhou', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: AlertCircle },
      expired: { label: 'Expirado', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: AlertCircle }
    };

    const config = statusConfig[report.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Relatórios Gerados
            </h2>
            <p className="text-sm mt-1 text-indigo-100">
              Cliente: {clientName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Todos ({reports.length})
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'ready'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Prontos ({reports.filter(r => r.status === 'ready' || r.status === 'downloaded').length})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Falhas ({reports.filter(r => r.status === 'failed').length})
              </button>
            </div>

            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Lista de Relatórios */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Carregando relatórios...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum relatório encontrado
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filter !== 'all' 
                  ? 'Tente alterar os filtros ou gerar um novo relatório'
                  : 'Gere seu primeiro relatório para começar'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {report.report_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {report.report_type_name}
                          </p>
                        </div>
                        {getStatusBadge(report)}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {new Date(report.created_at).toLocaleString('pt-BR')}
                        </div>
                        {report.duration_seconds > 0 && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            {formatDuration(report.duration_seconds)}
                          </div>
                        )}
                      </div>

                      {/* Mensagem de Erro */}
                      {report.status === 'failed' && report.error_message && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-400">
                              {report.error_message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                    <div className="flex space-x-2">
                      {report.has_pdf && (
                        <button
                          onClick={() => handleDownload(report.id, 'pdf')}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          PDF ({report.pdf_size_kb} KB)
                        </button>
                      )}
                      {report.has_csv && (
                        <button
                          onClick={() => handleDownload(report.id, 'csv')}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          CSV ({report.csv_size_kb} KB)
                        </button>
                      )}
                      {!report.has_pdf && !report.has_csv && report.status === 'ready' && (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          Processando arquivos...
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(report.id)}
                      className="flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredReports.length} relatório(s) exibido(s)
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitdefenderReportsListModal;
