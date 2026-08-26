import React, { useState, useEffect } from 'react';
import { X, Save, LoaderCircle, RefreshCw, FileText, Shield, Archive, Lock, Activity } from 'lucide-react';
import { BitdefenderLicense, FortigateDevice, RenewalStatus } from '../types';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';
import BitdefenderGenerateReportModal from './BitdefenderGenerateReportModal';
import BitdefenderReportsListModal from './BitdefenderReportsListModal';
import BitdefenderScheduleReportModal from './BitdefenderScheduleReportModal';

type ItemDetail = (BitdefenderLicense & { type: 'bitdefender' }) | (FortigateDevice & { type: 'fortigate' });

interface DetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetail | null;
  onUpdate: (id: number, data: Partial<BitdefenderLicense | FortigateDevice>, type: 'bitdefender' | 'fortigate') => Promise<void>;
  onSyncSuccess?: () => void;
  isAdmin: boolean;
}

const renewalStatusOptions: RenewalStatus[] = ['Pendente', 'Em Negociação', 'Renovado', 'Cancelado'];

type TabType = 'details' | 'reports' | 'scans' | 'quarantine' | 'isolation' | 'endpoints';

const DetailSidebar: React.FC<DetailSidebarProps> = ({ isOpen, onClose, item, onUpdate, onSyncSuccess, isAdmin }) => {
  const [formData, setFormData] = useState<Partial<BitdefenderLicense | FortigateDevice>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  
  // Modais de relatórios
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showReportsListModal, setShowReportsListModal] = useState(false);
  const [showScheduleReportModal, setShowScheduleReportModal] = useState(false);

  useEffect(() => {
    if (item) {
      // Mapeia o item completo para o estado do formulário
      setFormData(item);
      // Reset para aba de detalhes quando abrir
      setActiveTab('details');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isBitdefender = item.type === 'bitdefender';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleSubmit chamado');
    console.log('🔵 isAdmin:', isAdmin);
    console.log('🔵 formData:', formData);
    console.log('🔵 item:', item);
    
    if (!isAdmin) {
        toast.error("Você não tem permissão para editar este registro.");
        return;
    }
    
    setIsSaving(true);
    try {
        // Filtra apenas os campos que mudaram e converte para snake_case
        const updatedFields: any = {};
        Object.keys(formData).forEach(key => {
            const k = key as keyof (BitdefenderLicense | FortigateDevice);
            if (formData[k] !== item[k]) {
                // Converter camelCase para snake_case para o backend
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                updatedFields[snakeKey] = formData[k] as any;
            }
        });

        console.log('🔵 updatedFields:', updatedFields);
        console.log('🔵 Campos alterados:', Object.keys(updatedFields).length);

        if (Object.keys(updatedFields).length > 0) {
            console.log('🔵 Chamando onUpdate...');
            await onUpdate(item.id, updatedFields, item.type);
            console.log('✅ onUpdate concluído - handleSubmit finalizando');
        } else {
            console.log('⚠️ Nenhum campo foi alterado');
            toast.info('Nenhuma alteração detectada');
        }
        
    } catch (error) {
        console.error('❌ Erro no handleSubmit:', error);
        // O toast de erro já é tratado no Dashboard.tsx
    } finally {
        console.log('🔵 Finalizando handleSubmit - setIsSaving(false)');
        setIsSaving(false);
    }
  };

  const handleSync = async () => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para sincronizar.");
      return;
    }

    if (isBitdefender) {
      // Sincronizar Bitdefender
      const hasApiKey = (formData as any).clientApiKey;
      const hasAccessUrl = (formData as any).clientAccessUrl;

      if (!hasApiKey || !hasAccessUrl) {
        toast.error("Configure a API Key e Access URL antes de sincronizar.");
        return;
      }

      setIsSyncing(true);
      try {
        const result = await apiClient.bitdefenderAPI.syncClient(item.id);
        if (result.success) {
          toast.success(`Sincronizado com sucesso! ${result.devices_synced || 0} dispositivos atualizados.`);
          // Chamar callback para atualizar dados
          if (onSyncSuccess) {
            onSyncSuccess();
          }
          // Não fechar automaticamente - deixar o usuário decidir
        } else {
          toast.error(result.message || 'Erro ao sincronizar');
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao sincronizar com Bitdefender API');
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Sincronizar FortiGate
      const hasApiToken = (formData as any).apiToken;
      const hasApiIp = (formData as any).apiIp;

      if (!hasApiToken || !hasApiIp) {
        toast.error("Configure o API Token e IP antes de sincronizar.");
        return;
      }

      setIsSyncing(true);
      try {
        const result = await apiClient.fortigateAPI.syncDevice(item.id);
        if (result.success) {
          toast.success('Dispositivo sincronizado com sucesso!');
          // Chamar callback para atualizar dados
          if (onSyncSuccess) {
            onSyncSuccess();
          }
          // Não fechar automaticamente - deixar o usuário decidir
        } else {
          toast.error(result.message || 'Erro ao sincronizar');
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao sincronizar com FortiGate API');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const fields = isBitdefender ? [
    { label: 'Empresa', name: 'company', type: 'text', value: (formData as BitdefenderLicense).company, required: true },
    { label: 'Responsável', name: 'contactPerson', type: 'text', value: (formData as BitdefenderLicense).contactPerson },
    { label: 'Email', name: 'email', type: 'email', value: (formData as BitdefenderLicense).email },
    { label: 'Serial Chave', name: 'licenseKey', type: 'text', value: (formData as BitdefenderLicense).licenseKey, required: true },
    { label: 'Total de Licenças', name: 'totalLicenses', type: 'number', value: (formData as BitdefenderLicense).totalLicenses, required: true },
    { label: 'Vencimento', name: 'expirationDate', type: 'date', value: (formData as BitdefenderLicense).expirationDate },
    { label: 'API Key do Cliente (Opcional)', name: 'clientApiKey', type: 'password', value: (formData as any).clientApiKey, required: false },
    { label: 'Access URL do Cliente (Opcional)', name: 'clientAccessUrl', type: 'text', value: (formData as any).clientAccessUrl, required: false },
  ] : [
    { label: 'Cliente', name: 'client', type: 'text', value: (formData as FortigateDevice).client, required: true },
    { label: 'Email', name: 'email', type: 'email', value: (formData as FortigateDevice).email },
    { label: 'Serial', name: 'serial', type: 'text', value: (formData as FortigateDevice).serial },
    { label: 'Modelo', name: 'model', type: 'text', value: (formData as FortigateDevice).model, required: true },
    { label: 'Data de Registro', name: 'registrationDate', type: 'date', value: (formData as FortigateDevice).registrationDate },
    { label: 'Vencimento', name: 'vencimento', type: 'date', value: (formData as FortigateDevice).vencimento },
    { label: 'API Token (Opcional)', name: 'apiToken', type: 'password', value: (formData as any).apiToken, required: false },
    { label: 'API IP/Hostname (Opcional)', name: 'apiIp', type: 'text', value: (formData as any).apiIp, required: false },
  ];

  // Abas disponíveis
  const tabs: { id: TabType; label: string; icon: React.ReactNode; disabled?: boolean }[] = isBitdefender ? [
    { id: 'details', label: 'Detalhes', icon: <Activity className="w-4 h-4" /> },
    { id: 'reports', label: 'Relatórios', icon: <FileText className="w-4 h-4" /> },
    { id: 'scans', label: 'Scans', icon: <Shield className="w-4 h-4" /> },
    { id: 'quarantine', label: 'Quarentena', icon: <Archive className="w-4 h-4" /> },
    { id: 'isolation', label: 'Isolamento', icon: <Lock className="w-4 h-4" /> },
    { id: 'endpoints', label: 'Endpoints', icon: <Activity className="w-4 h-4" /> },
  ] : [
    { id: 'details', label: 'Detalhes', icon: <Activity className="w-4 h-4" /> },
  ];

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'reports':
        return renderReportsTab();
      case 'scans':
        return renderScansTab();
      case 'quarantine':
        return renderQuarantineTab();
      case 'isolation':
        return renderIsolationTab();
      case 'endpoints':
        return renderEndpointsTab();
      default:
        return renderDetailsTab();
    }
  };

  // Aba de Detalhes (conteúdo original)
  const renderDetailsTab = () => (
    <div className="space-y-4">
      {/* Status de Renovação */}
      <div>
        <label htmlFor="renewalStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status de Renovação</label>
        <select
          id="renewalStatus"
          name="renewalStatus"
          value={formData.renewalStatus || 'Pendente'}
          onChange={handleChange}
          disabled={!isAdmin}
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
        >
          {renewalStatusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Campos Dinâmicos */}
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
          </label>
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={field.value || ''}
            onChange={handleChange}
            required={field.required}
            disabled={!isAdmin}
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
          />
        </div>
      ))}

      {/* Campo de Observações */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          disabled={!isAdmin}
          rows={4}
          placeholder="Adicione informações extras, observações ou notas importantes..."
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50 resize-vertical"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use este campo para adicionar informações extras que possam ser úteis
        </p>
      </div>
    </div>
  );

  // Aba de Relatórios
  const renderReportsTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Gerar Relatórios</h3>
        <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
          Gere relatórios detalhados de malware, scans e status de segurança.
        </p>
        
        <div className="space-y-3">
          <button 
            type="button"
            onClick={() => setShowGenerateReportModal(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-between"
          >
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Relatório de Malware Status
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Novo</span>
          </button>

          <button 
            type="button"
            onClick={() => setShowGenerateReportModal(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-between"
          >
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Relatório de On-demand Scanning
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Novo</span>
          </button>
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Relatórios Recentes</h3>
          <button
            type="button"
            onClick={() => setShowReportsListModal(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver Todos
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowReportsListModal(true)}
          className="w-full text-sm text-gray-500 dark:text-gray-400 text-center py-8 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Clique para ver relatórios
        </button>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Agendamento Automático
        </h3>
        <p className="text-xs text-purple-700 dark:text-purple-400 mb-3">
          Configure relatórios automáticos diários, semanais ou mensais.
        </p>
        <button 
          type="button"
          onClick={() => setShowScheduleReportModal(true)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
        >
          Configurar Agendamento
        </button>
      </div>
    </div>
  );

  // Aba de Scans
  const renderScansTab = () => (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">Executar Scan</h3>
        <p className="text-xs text-green-700 dark:text-green-400 mb-4">
          Execute varreduras de segurança em endpoints remotamente.
        </p>
        
        <div className="space-y-3">
          <button 
            type="button"
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Quick Scan (Rápido)
          </button>

          <button 
            type="button"
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Full Scan (Completo)
          </button>

          <button 
            type="button"
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Custom Scan (Personalizado)
          </button>
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Scans em Andamento</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          <LoaderCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Nenhum scan em execução
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Histórico de Scans</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Nenhum histórico disponível
        </div>
      </div>
    </div>
  );

  // Aba de Quarentena
  const renderQuarantineTab = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center">
          <Archive className="w-4 h-4 mr-2" />
          Gerenciar Quarentena
        </h3>
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Visualize e gerencie arquivos em quarentena detectados pelo antivírus.
        </p>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Itens em Quarentena</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Nenhum item em quarentena
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          <strong>Dica:</strong> Arquivos em quarentena podem ser restaurados ou excluídos permanentemente.
        </p>
      </div>
    </div>
  );

  // Aba de Isolamento
  const renderIsolationTab = () => (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center">
          <Lock className="w-4 h-4 mr-2" />
          Isolamento de Endpoints
        </h3>
        <p className="text-xs text-red-700 dark:text-red-400 mb-4">
          Isole endpoints comprometidos para conter ameaças e evitar propagação.
        </p>

        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            ⚠️ <strong>Atenção:</strong> O isolamento bloqueia toda comunicação de rede do endpoint.
          </p>
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Endpoints Isolados</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Nenhum endpoint isolado
        </div>
      </div>

      <div className="space-y-2">
        <button 
          type="button"
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm flex items-center justify-center"
        >
          <Lock className="w-4 h-4 mr-2" />
          Isolar Endpoints Selecionados
        </button>

        <button 
          type="button"
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm flex items-center justify-center"
        >
          <Lock className="w-4 h-4 mr-2" />
          Remover Isolamento
        </button>
      </div>
    </div>
  );

  // Aba de Endpoints
  const renderEndpointsTab = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Endpoints Protegidos
        </h3>
        <p className="text-xs text-indigo-700 dark:text-indigo-400">
          Visualize todos os dispositivos protegidos por esta licença.
        </p>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lista de Endpoints</h3>
          <button 
            type="button"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Atualizar
          </button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Carregando endpoints...
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Protegidos</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">0</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Em Risco</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none'}`}>
        <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Detalhes da Licença Bitdefender
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isBitdefender ? (formData as BitdefenderLicense).company : (formData as FortigateDevice).client}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation (apenas para Bitdefender) */}
            {isBitdefender && (
              <div className="flex border-b dark:border-gray-700 overflow-x-auto bg-gray-50 dark:bg-gray-900/50">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all
                      ${activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
              {renderTabContent()}
            </form>

            {/* Footer Actions (apenas visível na aba de detalhes) */}
            {activeTab === 'details' && (
              <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                {/* Botão Sincronizar (apenas se tiver API configurada) */}
                {isAdmin && (
                  (isBitdefender && (formData as any).clientApiKey && (formData as any).clientAccessUrl) ||
                  (!isBitdefender && (formData as any).apiToken && (formData as any).apiIp)
                ) && (
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center transition-all"
                  >
                    {isSyncing ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sincronizar
                      </>
                    )}
                  </button>
                )}
                
                {/* Espaçador se não houver botão sincronizar */}
                {!(isAdmin && (
                  (isBitdefender && (formData as any).clientApiKey && (formData as any).clientAccessUrl) ||
                  (!isBitdefender && (formData as any).apiToken && (formData as any).apiIp)
                )) && <div></div>}

                {/* Botão Salvar */}
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  disabled={isSaving || !isAdmin} 
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center transition-all shadow-md"
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais de Relatórios */}
      {isBitdefender && item && (
        <>
          <BitdefenderGenerateReportModal
            isOpen={showGenerateReportModal}
            onClose={() => setShowGenerateReportModal(false)}
            clientId={item.id}
            clientName={(item as BitdefenderLicense).company}
            onReportGenerated={() => {
              setShowGenerateReportModal(false);
              setShowReportsListModal(true);
            }}
          />

          <BitdefenderReportsListModal
            isOpen={showReportsListModal}
            onClose={() => setShowReportsListModal(false)}
            clientId={item.id}
            clientName={(item as BitdefenderLicense).company}
          />

          <BitdefenderScheduleReportModal
            isOpen={showScheduleReportModal}
            onClose={() => setShowScheduleReportModal(false)}
            clientId={item.id}
            clientName={(item as BitdefenderLicense).company}
          />
        </>
      )}
    </>
  );
};

export default DetailSidebar;