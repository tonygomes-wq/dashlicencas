import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { O365Client, O365License, O365LicenseWithClient, RenewalStatus } from '../types';
import toast from 'react-hot-toast';

interface O365ClientTableProps {
  clients: O365Client[];
  licenses: O365LicenseWithClient[];
  onLicenseUpdate: (id: number, data: Partial<O365License>) => Promise<void>;
  isAdmin: boolean;
  onClientClick: (client: O365Client) => void; // Nova prop
}

const O365ClientTable: React.FC<O365ClientTableProps> = ({ clients, licenses, onClientClick }) => {
  
  // O estado de expansão (expandedClient) e a lógica de edição de licença (editingLicenseId, etc.)
  // foram movidos para o novo O365DetailModal.

  const pendingCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    licenses.forEach(license => {
      if (license.renewalStatus === 'Pendente') {
        const currentCount = map.get(license.clientId) || 0;
        map.set(license.clientId, currentCount + 1);
      }
    });
    return map;
  }, [licenses]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 w-10"></th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email de Contato
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Total de Licenças
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Pendentes
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client) => {
                const clientLicenses = licenses.filter(license => license.clientId === client.id);
                const pendingCount = pendingCountMap.get(client.id) || 0;
                return (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => onClientClick(client)}
                  >
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold">
                      {client.clientName}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      {client.contactEmail || 'N/A'}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{clientLicenses.length}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center">
                      {pendingCount > 0 ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white">
                              {pendingCount}
                          </span>
                      ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Nenhum cliente Office 365 encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default O365ClientTable;