import React, { useState, useEffect } from 'react';
import { X, Save, LoaderCircle } from 'lucide-react';
import { BitdefenderLicense, FortigateDevice, RenewalStatus } from '../types';
import toast from 'react-hot-toast';

type ItemDetail = (BitdefenderLicense & { type: 'bitdefender' }) | (FortigateDevice & { type: 'fortigate' });

interface DetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetail | null;
  onUpdate: (id: number, data: Partial<BitdefenderLicense | FortigateDevice>, type: 'bitdefender' | 'fortigate') => Promise<void>;
  isAdmin: boolean;
}

const renewalStatusOptions: RenewalStatus[] = ['Pendente', 'Em Negociação', 'Renovado', 'Cancelado'];

const DetailSidebar: React.FC<DetailSidebarProps> = ({ isOpen, onClose, item, onUpdate, isAdmin }) => {
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

  const handleSyncClient = async () => {
    if (!isBitdefender || !(formData as any).clientApiKey) {
      toast.error('Configure a API Key do cliente primeiro');
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando cliente...');

    try {
      const response = await fetch('/app_bitdefender_sync_client.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: item.id })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Sincronizado em ${result.duration}s!`, { id: toastId });
        
        // Atualizar dados no formulário
        if (result.data) {
          setFormData(prev => ({
            ...prev,
            licenseKey: result.data.licenseKey || prev.licenseKey,
            totalLicenses: result.data.totalLicenses || (prev as any).totalLicenses,
            expirationDate: result.data.expirationDate || (prev as any).expirationDate,
            lastSync: new Date().toISOString()
          }));
        }

        // Recarregar página para atualizar tabela
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(result.error || 'Erro na sincronização', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na sincronização', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const fields = isBitdefender ? [
    { label: 'Empresa', name: 'company', type: 'text', value: (formData as BitdefenderLicense).company, required: true },
    { label: 'Responsável', name: 'contactPerson', type: 'text', value: (formData as BitdefenderLicense).contactPerson },
    { label: 'Email', name: 'email', type: 'email', value: (formData as BitdefenderLicense).email },
    { label: 'Serial Chave', name: 'licenseKey', type: 'text', value: (formData as BitdefenderLicense).licenseKey, required: true },
    { label: 'Total de Licenças', name: 'totalLicenses', type: 'number', value: (formData as BitdefenderLicense).totalLicenses, required: true },
    { label: 'Vencimento', name: 'expirationDate', type: 'date', value: (formData as BitdefenderLicense).expirationDate },
    { label: 'API Key do Cliente', name: 'clientApiKey', type: 'password', value: (formData as any).clientApiKey, section: 'api', placeholder: 'API Key específica deste cliente (opcional)' },
    { label: 'Access URL do Cliente', name: 'clientAccessUrl', type: 'text', value: (formData as any).clientAccessUrl, section: 'api', placeholder: 'https://cloud.gravityzone.bitdefender.com/api' },
  ] : [
    { label: 'Cliente', name: 'client', type: 'text', value: (formData as FortigateDevice).client, required: true },
    { label: 'Email', name: 'email', type: 'email', value: (formData as FortigateDevice).email },
    { label: 'Serial', name: 'serial', type: 'text', value: (formData as FortigateDevice).serial },
    { label: 'Modelo', name: 'model', type: 'text', value: (formData as FortigateDevice).model, required: true },
    { label: 'Data de Registro', name: 'registrationDate', type: 'date', value: (formData as FortigateDevice).registrationDate },
    { label: 'Vencimento', name: 'vencimento', type: 'date', value: (formData as FortigateDevice).vencimento },
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
            {fields.filter(f => !f.section).map(field => (
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
                  placeholder={(field as any).placeholder}
                  className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                />
              </div>
            ))}

            {/* Seção de API (apenas Bitdefender) */}
            {isBitdefender && (
              <>
                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    API Bitdefender (Opcional)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Configure uma API Key específica para este cliente para sincronização individual
                  </p>
                </div>

                {fields.filter(f => f.section === 'api').map(field => (
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
                      disabled={!isAdmin}
                      placeholder={(field as any).placeholder}
                      className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                    />
                  </div>
                ))}

                {(formData as any).lastSync && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Última sincronização:</strong>{' '}
                      {new Date((formData as any).lastSync).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}

                {(formData as any).clientApiKey && (
                  <button
                    type="button"
                    onClick={handleSyncClient}
                    disabled={isSyncing || !isAdmin}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSyncing ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sincronizar Este Cliente
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </form>

          <div className="p-4 border-t dark:border-gray-700 flex justify-end">
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