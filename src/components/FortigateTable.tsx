import React, { useState } from 'react';
import { FortigateDevice, FortigateDeviceWithStatus, LicenseStatus } from '../types';
import { Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import FortigateAPIConfig from './FortigateAPIConfig';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';

interface FortigateTableProps {
  devices: FortigateDeviceWithStatus[];
  onRowClick: (device: FortigateDeviceWithStatus) => void;
  selectedItems: Set<string>;
  onSelectionChange: (itemId: string) => void;
  onDataUpdate?: () => void;
}

const StatusBadge: React.FC<{ status: LicenseStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-bold rounded-full text-white inline-block';
  const statusConfig = {
    [LicenseStatus.Vencido]: 'bg-red-600',
    [LicenseStatus.VenceHoje]: 'bg-yellow-500',
    [LicenseStatus.VenceEm7Dias]: 'bg-orange-500',
    [LicenseStatus.OK]: 'bg-green-600',
  };
  return <span className={`${baseClasses} ${statusConfig[status]}`}>{status}</span>;
};

const FortigateTable: React.FC<FortigateTableProps> = ({ devices, onRowClick, selectedItems, onSelectionChange, onDataUpdate }) => {
  const [configModalDevice, setConfigModalDevice] = useState<{ id: number; name: string } | null>(null);
  const [syncingDevices, setSyncingDevices] = useState<Set<number>>(new Set());
  const formatDate = (dateString: string | null) => {
    if (!dateString || !dateString.includes('-')) return 'Data inválida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    devices.forEach(device => {
      const itemId = `fortigate-${device.id}`;
      const isSelected = selectedItems.has(itemId);
      if (e.target.checked && !isSelected) {
        onSelectionChange(itemId);
      } else if (!e.target.checked && isSelected) {
        onSelectionChange(itemId);
      }
    });
  };

  const allVisibleSelected = devices.length > 0 && devices.every(d => selectedItems.has(`fortigate-${d.id}`));

  const handleSyncDevice = async (deviceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setSyncingDevices(prev => new Set(prev).add(deviceId));

    try {
      const result = await apiClient.fortigateAPI.syncDevice(deviceId);
      
      if (result.success) {
        toast.success(`Sincronizado em ${result.duration}s`);
        if (onDataUpdate) onDataUpdate();
      } else {
        toast.error(`Erro: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setSyncingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
    }
  };

  const handleOpenConfig = (deviceId: number, deviceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfigModalDevice({ id: deviceId, name: deviceName });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600">
                <input type="checkbox" onChange={handleSelectAll} checked={allVisibleSelected} />
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                API
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Serial
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Data de Registro
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Renovação
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Dias Restantes
              </th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? (
              devices.map((device) => {
                const itemId = `fortigate-${device.id}`;
                const isSelected = selectedItems.has(itemId);
                return (
                  <tr 
                    key={device.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    onClick={(e) => {
                        // Evita abrir o modal ao clicar no checkbox
                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            onRowClick(device);
                        }
                    }}
                  >
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => onSelectionChange(itemId)} />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => handleOpenConfig(device.id, device.client, e)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Configurar API"
                        >
                          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => handleSyncDevice(device.id, e)}
                          disabled={syncingDevices.has(device.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                          title="Sincronizar Agora"
                        >
                          <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${syncingDevices.has(device.id) ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {device.client}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {device.email}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap font-mono text-xs">{device.serial}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {device.model}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {formatDate(device.registrationDate)}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {formatDate(device.vencimento)}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{device.renewalStatus}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center">
                      <p className={`font-semibold whitespace-no-wrap ${device.remainingDays <= 7 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                        {device.remainingDays}
                      </p>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Nenhum dado encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Configuração */}
      {configModalDevice && (
        <FortigateAPIConfig
          deviceId={configModalDevice.id}
          deviceName={configModalDevice.name}
          isOpen={true}
          onClose={() => setConfigModalDevice(null)}
          onSuccess={() => {
            if (onDataUpdate) onDataUpdate();
          }}
        />
      )}
    </div>
  );
};

export default FortigateTable;