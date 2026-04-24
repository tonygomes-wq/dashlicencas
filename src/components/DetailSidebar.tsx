import React, { useState, useEffect } from 'react';
import { X, Save, LoaderCircle, RefreshCw } from 'lucide-react';
import { BitdefenderLicense, FortigateDevice, RenewalStatus } from '../types';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';

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

const DetailSidebar: React.FC<DetailSidebarProps> = ({ isOpen, onClose, item, onUpdate, onSyncSuccess, isAdmin }) => {
  const [formData, setFormData] = useState<Partial<BitdefenderLicense | FortigateDevice>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (item) {
      // Mapeia o item completo para o estado do formulário
      setFormData(item);
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
    if (!isAdmin) {
        toast.error("Você não tem permissão para editar este registro.");
        return;
    }
    
    setIsSaving(true);
    try {
        // Filtra apenas os campos que mudaram (opcional, mas bom para otimização)
        const updatedFields: Partial<BitdefenderLicense | FortigateDevice> = {};
        Object.keys(formData).forEach(key => {
            const k = key as keyof (BitdefenderLicense | FortigateDevice);
            if (formData[k] !== item[k]) {
                updatedFields[k] = formData[k] as any;
            }
        });

        if (Object.keys(updatedFields).length > 0) {
            await onUpdate(item.id, updatedFields, item.type);
        }
        
    } catch (error) {
        // O toast de erro já é tratado no Dashboard.tsx
    } finally {
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
          onClose();
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
          onClose();
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

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none'}`}>
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Detalhes do {isBitdefender ? 'Licença Bitdefender' : 'Dispositivo Fortigate'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
            
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
          </form>

          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
            {/* Botão Sincronizar (apenas se tiver API configurada) */}
            {isAdmin && (
              (isBitdefender && (formData as any).clientApiKey && (formData as any).clientAccessUrl) ||
              (!isBitdefender && (formData as any).apiToken && (formData as any).apiIp)
            ) && (
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center"
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
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
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
        </div>
      </div>
    </div>
  );
};

export default DetailSidebar;