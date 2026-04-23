import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { HardwareDevice, StorageDevice, DeviceType, DeviceStatus, StorageType } from '../types';

interface AddHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: Omit<HardwareDevice, 'id' | 'lastUpdate' | 'userId'>) => Promise<void>;
}

const AddHardwareModal: React.FC<AddHardwareModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: 'Desktop' as DeviceType,
    clientName: '',
    location: '',
    cpuModel: '',
    cpuCores: '',
    cpuFrequency: '',
    ramSize: '',
    ramType: '',
    ramSpeed: '',
    osName: '',
    osVersion: '',
    macAddress: '',
    ipAddress: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    purchaseDate: '',
    warrantyExpiration: '',
    notes: '',
    status: 'Ativo' as DeviceStatus,
  });

  const [storageDevices, setStorageDevices] = useState<StorageDevice[]>([
    { type: 'SSD', capacity: 256, manufacturer: '', model: '', interface: 'SATA' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStorageChange = (index: number, field: keyof StorageDevice, value: any) => {
    const updated = [...storageDevices];
    updated[index] = { ...updated[index], [field]: value };
    setStorageDevices(updated);
  };

  const addStorage = () => {
    setStorageDevices([...storageDevices, { type: 'SSD', capacity: 256, manufacturer: '', model: '', interface: 'SATA' }]);
  };

  const removeStorage = (index: number) => {
    setStorageDevices(storageDevices.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAdd({
        ...formData,
        cpuCores: formData.cpuCores ? parseInt(formData.cpuCores) : undefined,
        ramSize: parseInt(formData.ramSize),
        storageDevices: storageDevices.map(s => ({
          ...s,
          capacity: typeof s.capacity === 'string' ? parseInt(s.capacity) : s.capacity
        })),
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiration: formData.warrantyExpiration || undefined,
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding hardware:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deviceName: '', deviceType: 'Desktop', clientName: '', location: '',
      cpuModel: '', cpuCores: '', cpuFrequency: '',
      ramSize: '', ramType: '', ramSpeed: '',
      osName: '', osVersion: '',
      macAddress: '', ipAddress: '',
      serialNumber: '', manufacturer: '', model: '',
      purchaseDate: '', warrantyExpiration: '', notes: '',
      status: 'Ativo',
    });
    setStorageDevices([{ type: 'SSD', capacity: 256, manufacturer: '', model: '', interface: 'SATA' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adicionar Dispositivo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Dispositivo *
                </label>
                <input
                  type="text"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: PC-001, NB-045"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo *
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="Desktop">Desktop</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Workstation">Workstation</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Sala 101, Matriz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hardware */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Especificações de Hardware</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Modelo do Processador *
                </label>
                <input
                  type="text"
                  name="cpuModel"
                  value={formData.cpuModel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Intel Core i7-12700K"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Núcleos
                </label>
                <input
                  type="number"
                  name="cpuCores"
                  value={formData.cpuCores}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequência
                </label>
                <input
                  type="text"
                  name="cpuFrequency"
                  value={formData.cpuFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 3.6 GHz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Memória RAM (GB) *
                </label>
                <input
                  type="number"
                  name="ramSize"
                  value={formData.ramSize}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de RAM
                </label>
                <input
                  type="text"
                  name="ramType"
                  value={formData.ramType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: DDR4, DDR5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Velocidade da RAM
                </label>
                <input
                  type="text"
                  name="ramSpeed"
                  value={formData.ramSpeed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 3200 MHz"
                />
              </div>
            </div>
          </div>

          {/* Armazenamento */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Armazenamento</h3>
              <button
                type="button"
                onClick={addStorage}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </button>
            </div>
            {storageDevices.map((storage, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={storage.type}
                    onChange={(e) => handleStorageChange(index, 'type', e.target.value as StorageType)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="SSD">SSD</option>
                    <option value="HDD">HDD</option>
                    <option value="NVMe">NVMe</option>
                    <option value="M.2">M.2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidade (GB)</label>
                  <input
                    type="number"
                    value={storage.capacity}
                    onChange={(e) => handleStorageChange(index, 'capacity', parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={storage.manufacturer || ''}
                    onChange={(e) => handleStorageChange(index, 'manufacturer', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Interface</label>
                  <input
                    type="text"
                    value={storage.interface || ''}
                    onChange={(e) => handleStorageChange(index, 'interface', e.target.value)}
                    placeholder="SATA, PCIe"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeStorage(index)}
                    disabled={storageDevices.length === 1}
                    className="w-full px-2 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sistema e Rede */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sistema e Rede</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sistema Operacional</label>
                <input
                  type="text"
                  name="osName"
                  value={formData.osName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Windows 11 Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versão do SO</label>
                <input
                  type="text"
                  name="osVersion"
                  value={formData.osVersion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 22H2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço MAC</label>
                <input
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 00:1A:2B:3C:4D:5E"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço IP</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: 192.168.1.100"
                />
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Série</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fabricante</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Dell, HP, Lenovo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Compra</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vencimento da Garantia</label>
                <input
                  type="date"
                  name="warrantyExpiration"
                  value={formData.warrantyExpiration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Informações adicionais sobre o dispositivo"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Dispositivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHardwareModal;
