import React, { useState } from 'react';
import { X, Edit, Save, HardDrive, Cpu, MemoryStick, Monitor, Calendar, AlertTriangle } from 'lucide-react';
import { HardwareWithWarrantyStatus, StorageDevice } from '../types';

interface HardwareDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: HardwareWithWarrantyStatus | null;
  onUpdate: (id: number, data: Partial<HardwareWithWarrantyStatus>) => Promise<void>;
  canEdit: boolean;
}

const HardwareDetailModal: React.FC<HardwareDetailModalProps> = ({
  isOpen,
  onClose,
  device,
  onUpdate,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  if (!isOpen || !device) return null;

  const handleEdit = () => {
    setEditData({ ...device });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onUpdate(device.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const currentData = isEditing ? editData : device;
  const totalStorage = device.storageDevices.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{device.deviceName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{device.clientName}</p>
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && !isEditing && (
              <button
                onClick={handleEdit}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Garantia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">{device.status}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tipo</span>
                <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">{device.deviceType}</p>
            </div>

            <div className={`p-4 rounded-lg ${
              device.warrantyStatus === 'Expirada' ? 'bg-red-50 dark:bg-red-900/20' :
              device.warrantyStatus === 'Expira em 30 dias' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Garantia</span>
                {device.warrantyStatus === 'Expirada' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {device.warrantyExpiration ? device.warrantyStatus : 'N/A'}
              </p>
            </div>
          </div>

          {/* Especificações de Hardware */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              Especificações de Hardware
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Processador" value={device.cpuModel} icon={<Cpu className="w-4 h-4" />} />
              {device.cpuCores && <InfoField label="Núcleos" value={`${device.cpuCores} cores`} />}
              {device.cpuFrequency && <InfoField label="Frequência" value={device.cpuFrequency} />}
              <InfoField label="Memória RAM" value={`${device.ramSize} GB`} icon={<MemoryStick className="w-4 h-4" />} />
              {device.ramType && <InfoField label="Tipo de RAM" value={device.ramType} />}
              {device.ramSpeed && <InfoField label="Velocidade RAM" value={device.ramSpeed} />}
            </div>
          </div>

          {/* Armazenamento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <HardDrive className="w-5 h-5 mr-2 text-blue-600" />
              Armazenamento ({totalStorage} GB Total)
            </h3>
            <div className="space-y-2">
              {device.storageDevices.map((storage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {storage.type} - {storage.capacity} GB
                      </p>
                      {(storage.manufacturer || storage.interface) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {[storage.manufacturer, storage.interface].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sistema Operacional */}
          {(device.osName || device.osVersion) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sistema Operacional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {device.osName && <InfoField label="Sistema" value={device.osName} />}
                {device.osVersion && <InfoField label="Versão" value={device.osVersion} />}
              </div>
            </div>
          )}

          {/* Rede */}
          {(device.macAddress || device.ipAddress) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações de Rede</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {device.macAddress && <InfoField label="Endereço MAC" value={device.macAddress} />}
                {device.ipAddress && <InfoField label="Endereço IP" value={device.ipAddress} />}
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {device.serialNumber && <InfoField label="Número de Série" value={device.serialNumber} />}
              {device.manufacturer && <InfoField label="Fabricante" value={device.manufacturer} />}
              {device.model && <InfoField label="Modelo" value={device.model} />}
              {device.location && <InfoField label="Localização" value={device.location} />}
              {device.purchaseDate && (
                <InfoField 
                  label="Data de Compra" 
                  value={new Date(device.purchaseDate).toLocaleDateString('pt-BR')} 
                />
              )}
              {device.warrantyExpiration && (
                <InfoField 
                  label="Vencimento da Garantia" 
                  value={new Date(device.warrantyExpiration).toLocaleDateString('pt-BR')} 
                />
              )}
            </div>
          </div>

          {/* Observações */}
          {device.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Observações</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{device.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoField: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start space-x-2">
    {icon && <div className="text-gray-400 mt-1">{icon}</div>}
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export default HardwareDetailModal;
