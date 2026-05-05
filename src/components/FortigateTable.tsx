import React, { useState } from 'react';
import { FortigateDevice, FortigateDeviceWithStatus, LicenseStatus } from '../types';
import { Settings, RefreshCw, Wifi, WifiOff, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
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

type SortField = 'cliente' | 'vencimento' | 'registrationDate' | 'remainingDays';
type SortDirection = 'asc' | 'desc' | null;

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
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString || !dateString.includes('-')) return 'Data inválida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtrar por status
  const filteredDevices = statusFilter === 'all' 
    ? devices 
    : devices.filter(device => device.status === statusFilter);

  // Ordenar
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'cliente':
        aValue = a.client?.toLowerCase() || '';
        bValue = b.client?.toLowerCase() || '';
        break;
      case 'vencimento':
        aValue = a.vencimento ? new Date(a.vencimento).getTime() : 0;
        bValue = b.vencimento ? new Date(b.vencimento).getTime() : 0;
        break;
      case 'registrationDate':
        aValue = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
        bValue = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
        break;
      case 'remainingDays':
        aValue = a.remainingDays;
        bValue = b.remainingDays;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Ciclo: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    sortedDevices.forEach(device => {
      const itemId = `fortigate-${device.id}`;
      const isSelected = selectedItems.has(itemId);
      if (e.target.checked && !isSelected) {
        onSelectionChange(itemId);
      } else if (!e.target.checked && isSelected) {
        onSelectionChange(itemId);
      }
    });
  };

  const allVisibleSelected = sortedDevices.length > 0 && sortedDevices.every(d => selectedItems.has(`fortigate-${d.id}`));

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
      {/* Filtro de Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filtrar por Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LicenseStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value={LicenseStatus.OK}>OK</option>
            <option value={LicenseStatus.VenceEm7Dias}>Vence em 7 dias</option>
            <option value={LicenseStatus.VenceHoje}>Vence Hoje</option>
            <option value={LicenseStatus.Vencido}>Vencido</option>
          </select>
          {statusFilter !== 'all' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({filteredDevices.length} {filteredDevices.length === 1 ? 'resultado' : 'resultados'})
            </span>
          )}
        </div>
      </div>

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
                <button
                  onClick={() => handleSort('cliente')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Cliente
                  <SortIcon field="cliente" />
                </button>
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
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Data de Registro
                  <SortIcon field="registrationDate" />
                </button>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('vencimento')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Vencimento
                  <SortIcon field="vencimento" />
                </button>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Renovação
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('remainingDays')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                >
                  Dias Restantes
                  <SortIcon field="remainingDays" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.length > 0 ? (
              sortedDevices.map((device) => {
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