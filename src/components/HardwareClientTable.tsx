import React, { useState } from 'react';
import { HardwareWithWarrantyStatus } from '../types';
import { ChevronDown, ChevronRight, Plus, Building2, Monitor, Trash2, Edit } from 'lucide-react';
import HardwareInventoryTable from './HardwareInventoryTable';

interface HardwareClient {
  id: number;
  clientName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  devices: HardwareWithWarrantyStatus[];
  totalDevices: number;
}

interface HardwareClientTableProps {
  devices: HardwareWithWarrantyStatus[];
  clients: any[]; // Lista de clientes da API
  onRowClick: (device: HardwareWithWarrantyStatus) => void;
  onDelete?: (id: number) => void;
  onAddDevice: (clientName: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const HardwareClientTable: React.FC<HardwareClientTableProps> = ({
  devices,
  clients,
  onRowClick,
  onDelete,
  onAddDevice,
  canEdit,
  canDelete
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Criar mapa de clientes com seus dispositivos
  const clientsWithDevices: HardwareClient[] = clients.map(client => {
    const clientDevices = devices.filter(device => device.clientName === client.clientName);
    return {
      id: client.id,
      clientName: client.clientName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      devices: clientDevices,
      totalDevices: clientDevices.length
    };
  });

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const getClientStats = (devices: HardwareWithWarrantyStatus[]) => {
    const active = devices.filter(d => d.status === 'Ativo').length;
    const maintenance = devices.filter(d => d.status === 'Manutenção').length;
    const warrantyExpired = devices.filter(d => d.warrantyStatus === 'Expirada').length;
    
    return { active, maintenance, warrantyExpired };
  };

  if (clientsWithDevices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhum cliente cadastrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione um novo cliente para começar a gerenciar dispositivos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clientsWithDevices.map((client) => {
        const isExpanded = expandedClients.has(client.clientName);
        const stats = getClientStats(client.devices);

        return (
          <div
            key={client.clientName}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Cabeçalho do Cliente */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    onClick={() => toggleClient(client.clientName)}
                    className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {client.clientName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {client.totalDevices} {client.totalDevices === 1 ? 'dispositivo' : 'dispositivos'}
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas Rápidas */}
                  <div className="flex items-center space-x-4 ml-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {stats.active} Ativos
                      </span>
                    </div>
                    {stats.maintenance > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {stats.maintenance} Manutenção
                        </span>
                      </div>
                    )}
                    {stats.warrantyExpired > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {stats.warrantyExpired} Garantia Expirada
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão Adicionar Dispositivo */}
                {canEdit && (
                  <button
                    onClick={() => onAddDevice(client.clientName)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Dispositivo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Dispositivos (Expandível) */}
            {isExpanded && (
              <div className="p-4">
                {client.devices.length > 0 ? (
                  <HardwareInventoryTable
                    devices={client.devices}
                    onRowClick={onRowClick}
                    onDelete={onDelete}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dispositivo cadastrado para este cliente</p>
                    <p className="text-sm mt-2">Clique em "Adicionar Dispositivo" para começar</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HardwareClientTable;
