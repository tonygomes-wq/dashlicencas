import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GmailClient, GmailLicense } from '../types';
import toast from 'react-hot-toast';

interface LicenseForm {
    username: string;
    email: string;
    password: string;
    licenseType: string;
}

interface AddGmailClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<GmailClient, 'id'>, licenses: Omit<GmailLicense, 'id' | 'clientId' | 'renewalStatus'>[]) => Promise<void>;
}

const initialLicenseState: LicenseForm = {
    username: '',
    email: '',
    password: '',
    licenseType: '',
};

const AddGmailClientModal: React.FC<AddGmailClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [licenses, setLicenses] = useState<LicenseForm[]>([initialLicenseState]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'clientName') setClientName(value);
    if (name === 'contactEmail') setContactEmail(value);
  };

  const handleLicenseChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newLicenses = [...licenses];
    newLicenses[index] = { ...newLicenses[index], [name]: value };
    setLicenses(newLicenses);
  };

  const addLicense = () => {
    setLicenses(prev => [...prev, initialLicenseState]);
  };

  const removeLicense = (index: number) => {
    setLicenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
        toast.error("O nome do cliente é obrigatório.");
        return;
    }
    if (licenses.some(l => !l.email || !l.username || !l.licenseType)) {
        toast.error("Todos os campos de licença (usuário, email, tipo) são obrigatórios.");
        return;
    }

    setIsSaving(true);
    
    const clientData: Omit<GmailClient, 'id'> = { clientName, contactEmail: contactEmail || null };
    const licensesData: Omit<GmailLicense, 'id' | 'clientId' | 'renewalStatus'>[] = licenses.map(l => ({
        username: l.username,
        email: l.email,
        password: l.password || null,
        licenseType: l.licenseType,
    }));

    await onSave(clientData, licensesData);
    
    setIsSaving(false);
    setClientName('');
    setContactEmail('');
    setLicenses([initialLicenseState]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Adicionar Novo Cliente GMAIL</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            {/* Informações do Cliente */}
            <div className="border p-4 rounded-lg dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Dados do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="clientName" placeholder="Nome do Cliente (Empresa)" value={clientName} onChange={handleClientChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    <input type="email" name="contactEmail" placeholder="Email de Contato do Cliente" value={contactEmail} onChange={handleClientChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
            </div>

            {/* Licenças/Usuários */}
            <div className="border p-4 rounded-lg dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Licenças / Usuários</h3>
                    <button type="button" onClick={addLicense} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Adicionar Usuário
                    </button>
                </div>
                
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {licenses.map((license, index) => (
                        <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Usuário</label>
                                <input type="text" name="username" placeholder="Nome do Usuário" value={license.username} onChange={(e) => handleLicenseChange(index, e)} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <input type="email" name="email" placeholder="Email do Usuário" value={license.email} onChange={(e) => handleLicenseChange(index, e)} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tipo de Licença</label>
                                <input type="text" name="licenseType" placeholder="Ex: Business Standard" value={license.licenseType} onChange={(e) => handleLicenseChange(index, e)} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Senha (Opcional)</label>
                                <input type="password" name="password" placeholder="Senha" value={license.password} onChange={(e) => handleLicenseChange(index, e)} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm" />
                            </div>
                            {licenses.length > 1 && (
                                <button type="button" onClick={() => removeLicense(index)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 self-center">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSaving ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGmailClientModal;