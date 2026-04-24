import React, { useState } from 'react';
import { BitdefenderLicense } from '../types';
import { X } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';

interface AddBitdefenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBitdefenderModal: React.FC<AddBitdefenderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const initialState = {
    company: '',
    contactPerson: '',
    email: '',
    licenseKey: '',
    totalLicenses: 0,
    expirationDate: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      company: formData.company,
      contact_person: formData.contactPerson,
      email: formData.email,
      license_key: formData.licenseKey,
      total_licenses: Number(formData.totalLicenses),
      expiration_date: formData.expirationDate,
      renewal_status: 'Pendente',
      notes: formData.notes || ''
    };
    
    console.log('📤 Enviando dados:', payload);
    
    try {
      const result = await apiClient.bitdefender.create(payload);
      console.log('✅ Resposta recebida:', result);
      toast.success('Licença adicionada com sucesso!');
      setFormData(initialState);
      onSuccess();
    } catch (error: any) {
      console.error('❌ Erro ao adicionar licença:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      toast.error(error.message || 'Erro ao adicionar licença');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full transform transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Adicionar Nova Licença Bitdefender</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="company" placeholder="Empresa" value={formData.company} onChange={handleChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="text" name="contactPerson" placeholder="Responsável" value={formData.contactPerson} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="text" name="licenseKey" placeholder="Serial Chave" value={formData.licenseKey} onChange={handleChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="number" name="totalLicenses" placeholder="Total de Licenças" value={formData.totalLicenses} onChange={handleChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="date" name="expirationDate" placeholder="Vencimento" value={formData.expirationDate} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <textarea name="notes" placeholder="Observações" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2" rows={3}></textarea>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBitdefenderModal;