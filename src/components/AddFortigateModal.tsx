import React, { useState } from 'react';
import { FortigateDevice } from '../types';
import { X } from 'lucide-react';

interface AddFortigateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FortigateDevice, 'id'>) => Promise<void>;
}

const AddFortigateModal: React.FC<AddFortigateModalProps> = ({ isOpen, onClose, onSave }) => {
  const initialState = {
    client: '',
    serial: '',
    model: '',
    email: '',
    registrationDate: '',
    vencimento: '',
  };
  const [formData, setFormData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    setFormData(initialState);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full transform transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Adicionar Novo Dispositivo Fortigate</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="client" placeholder="Cliente" value={formData.client} onChange={handleChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="text" name="serial" placeholder="Serial" value={formData.serial} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="text" name="model" placeholder="Modelo" value={formData.model} onChange={handleChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <div className="md:col-span-1">
                <label className="text-sm text-gray-500 dark:text-gray-400">Data de Registro</label>
                <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-1">
                <label className="text-sm text-gray-500 dark:text-gray-400">Vencimento</label>
                <input type="date" name="vencimento" value={formData.vencimento} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
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

export default AddFortigateModal;