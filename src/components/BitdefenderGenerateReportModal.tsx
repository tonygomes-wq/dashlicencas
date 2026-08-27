import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Filter, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportType {
  id: number;
  name: string;
  description: string;
  category: string;
  popular?: boolean;
}

interface ReportingInterval {
  value: string;
  label: string;
  days: number;
}

interface BitdefenderGenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
  initialReportType?: number | null;
  onReportGenerated?: () => void;
}

const BitdefenderGenerateReportModal: React.FC<BitdefenderGenerateReportModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  initialReportType,
  onReportGenerated
}) => {
  const [step, setStep] = useState<'select' | 'options' | 'generating' | 'success'>('select');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportingInterval, setReportingInterval] = useState('thisMonth');
  const [filterType, setFilterType] = useState(0);
  const [detailedExport, setDetailedExport] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [intervals, setIntervals] = useState<ReportingInterval[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchReportTypes();
      fetchIntervals();
      
      // Se initialReportType foi fornecido, pular para opções
      if (initialReportType) {
        setSelectedType(initialReportType);
        setStep('options');
      } else {
        // Reset state
        setStep('select');
        setSelectedType(null);
      }
      
      setReportName('');
      setReportingInterval('thisMonth');
      setFilterType(0);
      setDetailedExport(true);
      setGeneratedReport(null);
    }
  }, [isOpen, initialReportType]);

  const fetchReportTypes = async () => {
    try {
      const response = await fetch('/app_bitdefender_reports.php?action=types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar tipos de relatórios');

      const data = await response.json();
      if (data.success) {
        setReportTypes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
      toast.error('Erro ao carregar tipos de relatórios');
    }
  };

  const fetchIntervals = async () => {
    try {
      const response = await fetch('/app_bitdefender_reports.php?action=intervals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar intervalos');

      const data = await response.json();
      if (data.success) {
        setIntervals(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar intervalos:', error);
      toast.error('Erro ao carregar intervalos');
    }
  };

  const handleSelectType = (typeId: number) => {
    setSelectedType(typeId);
    const type = reportTypes.find(t => t.id === typeId);
    if (type) {
      setReportName(`${type.name} - ${new Date().toLocaleDateString('pt-BR')}`);
    }
    setStep('options');
  };

  const handleGenerate = async () => {
    if (!selectedType) return;

    setIsGenerating(true);
    setStep('generating');

    try {
      const payload = {
        action: 'create_report',
        client_id: clientId,
        report_type: selectedType,
        report_name: reportName,
        reporting_interval: reportingInterval,
        filter_type: filterType,
        detailed_export: detailedExport
      };

      const response = await fetch('/app_bitdefender_reports.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao gerar relatório');

      const data = await response.json();

      if (data.success) {
        setGeneratedReport(data.data);
        setStep('success');
        toast.success('Relatório gerado com sucesso!');
        
        // Chamar callback se fornecido
        if (onReportGenerated) {
          onReportGenerated();
        }
      } else {
        throw new Error(data.error || 'Erro ao gerar relatório');
      }
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(error.message || 'Erro ao gerar relatório');
      setStep('options');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (fileType: 'pdf' | 'csv') => {
    if (!generatedReport) return;

    try {
      const url = `/app_bitdefender_reports.php?action=download&id=${generatedReport.id}&type=${fileType}`;
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      toast.success(`Download do ${fileType.toUpperCase()} iniciado`);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download');
    }
  };

  const selectedReportType = reportTypes.find(t => t.id === selectedType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Gerar Relatório Bitdefender
            </h2>
            <p className="text-sm mt-1 text-blue-100">
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Selecionar Tipo */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Selecione o Tipo de Relatório
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Escolha o tipo de relatório que deseja gerar
                </p>
              </div>

              {/* Relatórios Populares */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded mr-2">
                    Popular
                  </span>
                  Mais Utilizados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTypes.filter(t => t.popular).map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all text-left bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          ID: {type.id}
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {type.name}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outros Relatórios */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Outros Relatórios
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTypes.filter(t => !t.popular).map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                          ID: {type.id}
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                        {type.name}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Opções do Relatório */}
          {step === 'options' && selectedReportType && (
            <div className="space-y-6">
              {/* Tipo Selecionado */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                    {selectedReportType.name}
                  </h3>
                  <button
                    onClick={() => setStep('select')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Alterar
                  </button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {selectedReportType.description}
                </p>
              </div>

              {/* Nome do Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Nome do Relatório
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite um nome para o relatório"
                />
              </div>

              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Período
                </label>
                <select
                  value={reportingInterval}
                  onChange={(e) => setReportingInterval(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {intervals.map(interval => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opções Específicas para Malware Status (Tipo 12) */}
              {selectedType === 12 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Filter className="w-4 h-4 inline mr-2" />
                      Filtro de Endpoints
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={0}>Todos os endpoints</option>
                      <option value={1}>Somente endpoints infectados</option>
                    </select>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <input
                      type="checkbox"
                      id="detailedExport"
                      checked={detailedExport}
                      onChange={(e) => setDetailedExport(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="detailedExport" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        Incluir detalhes completos no PDF
                      </span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Adiciona informações detalhadas de status de malware de cada endpoint no relatório PDF
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Informações Adicionais */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Informações do Relatório
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Formato: PDF + CSV
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Geração: Instantânea
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Download: Disponível imediatamente
                  </li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!reportName}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold"
                >
                  Gerar Relatório
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Gerando */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-blue-200 dark:border-blue-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-8 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
                Gerando Relatório...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                Aguarde enquanto o relatório está sendo gerado no Bitdefender GravityZone.
                <br />
                Isso pode levar alguns segundos.
              </p>
              <div className="mt-6 flex items-center text-sm text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4 mr-2" />
                Tempo estimado: 10-30 segundos
              </div>
            </div>
          )}

          {/* Step 4: Sucesso */}
          {step === 'success' && generatedReport && (
            <div className="space-y-6">
              {/* Mensagem de Sucesso */}
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-2">
                  Relatório Gerado com Sucesso!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Seu relatório está pronto para download
                </p>
              </div>

              {/* Detalhes do Relatório */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Detalhes do Relatório
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{generatedReport.report_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{generatedReport.report_type_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <p className="font-medium">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs">
                        {generatedReport.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Gerado em:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(generatedReport.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Download */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Fazer Download
                </h4>
                
                {generatedReport.has_pdf && (
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <Download className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold">Download PDF</p>
                        <p className="text-xs text-red-100">
                          Arquivo PDF formatado ({generatedReport.pdf_size_kb} KB)
                        </p>
                      </div>
                    </span>
                    <FileText className="w-6 h-6" />
                  </button>
                )}

                {generatedReport.has_csv && (
                  <button
                    onClick={() => handleDownload('csv')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <Download className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold">Download CSV</p>
                        <p className="text-xs text-green-100">
                          Planilha de dados ({generatedReport.csv_size_kb} KB)
                        </p>
                      </div>
                    </span>
                    <FileText className="w-6 h-6" />
                  </button>
                )}

                {!generatedReport.has_pdf && !generatedReport.has_csv && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                          Arquivos ainda não disponíveis
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          O relatório foi criado no Bitdefender, mas os arquivos ainda estão sendo processados.
                          Aguarde alguns instantes e verifique novamente na lista de relatórios.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BitdefenderGenerateReportModal;
