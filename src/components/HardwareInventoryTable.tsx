import React, { useState, useMemo } from 'react';
import { HardwareWithWarrantyStatus, DeviceType, DeviceStatus } from '../types';
import { Monitor, Server, Laptop, HardDrive, Cpu, MemoryStick, AlertTriangle, CheckCircle, Clock, Trash2, Edit, Eye } from 'lucide-react';
import ExportButton from './ExportButton';

interface HardwareInventoryTableProps {
  devices: HardwareWithWarrantyStatus[];
  onRowClick: (device: HardwareWithWarrantyStatus) => void;
  onDelete?: (id: number) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const HardwareInventoryTable: React.FC<HardwareInventoryTableProps> = ({
  devices,
  onRowClick,
  onDelete,
  canEdit,
  canDelete
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'Desktop': return Monitor;
      case 'Notebook': return Laptop;
      case 'Servidor': return Server;
      case 'Workstation': return Cpu;
      default: return HardDrive;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inativo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'Manutenção': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Descartado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWarrantyIcon = (status: string) => {
    switch (status) {
      case 'Expirada': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Expira em 30 dias': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Válida': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getTotalStorage = (device: HardwareWithWarrantyStatus) => {
    return device.storageDevices.reduce((sum, storage) => sum + storage.capacity, 0);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(devices.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {canDelete && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === devices.length && devices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dispositivo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                RAM
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Armazenamento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Garantia
              </th>
              {(canEdit || canDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.deviceType);
              const totalStorage = getTotalStorage(device);
              
              return (
                <tr
                  key={device.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onRowClick(device)}
                >
                  {canDelete && (
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(device.id)}
                        onChange={() => handleSelectOne(device.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {device.deviceName}
                        </div>
                        {device.serialNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            SN: {device.serialNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {device.clientName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {device.deviceType}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-xs truncate" title={device.cpuModel}>
                      {device.cpuModel}
                    </div>
                    {device.cpuCores && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {device.cpuCores} cores
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <MemoryStick className="w-4 h-4 mr-1 text-gray-400" />
                      {device.ramSize} GB
                    </div>
                    {device.ramType && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {device.ramType}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <HardDrive className="w-4 h-4 mr-1 text-gray-400" />
                      {totalStorage} GB
                    </div>
                    {device.storageDevices.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {device.storageDevices.map(s => s.type).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getWarrantyIcon(device.warrantyStatus)}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {device.warrantyExpiration ? (
                          device.warrantyStatus === 'Expirada' ? 'Expirada' : `${device.warrantyDaysRemaining}d`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </span>
                    </div>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onRowClick(device)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canDelete && onDelete && (
                          <button
                            onClick={() => onDelete(device.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {devices.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dispositivo encontrado</p>
        </div>
      )}
    </div>
  );
};

export default HardwareInventoryTable;
