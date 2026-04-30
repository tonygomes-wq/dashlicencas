import React, { useState } from 'react';
import { ChevronRight, Edit2, Save, X } from 'lucide-react';
import { O365Client, O365License, O365LicenseWithClient, RenewalStatus } from '../types';
import toast from 'react-hot-toast';

interface O365ClientTableProps {
  clients: O365Client[];
  licenses: O365LicenseWithClient[];
  onLicenseUpdate: (id: number, data: Partial<O365License>) => Promise<void>;
  onClientUpdate: (id: string, data: Partial<O365Client>) => Promise<void>; // Nova prop
  isAdmin: boolean;
  onClientClick: (client: O365Client) => void;
}

const O365ClientTable: React.FC<O365ClientTableProps> = ({ clients, licenses, onClientUpdate, isAdmin, onClientClick }) => {
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ clientName: string; contactEmail: string }>({ clientName: '', contactEmail: '' });
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleEditClick = (e: React.MouseEvent, client: O365Client) => {
    e.stopPropagation(); // Evita abrir o modal
    setEditingClientId(client.id);
    setEditingData({
      clientName: client.clientName,
      contactEmail: client.contactEmail || ''
    });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(null);
    setEditingData({ clientName: '', contactEmail: '' });
  };

  const handleSaveEdit = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    
    if (!editingData.clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      await onClientUpdate(clientId, {
        clientName: editingData.clientName,
        contactEmail: editingData.contactEmail || null
      });
      toast.success('Cliente atualizado com sucesso!');
      setEditingClientId(null);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
    } finally {
      setIsSaving(false);
    }
  };

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
              {isAdmin && (
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-20">
                  Ações
                </th>
              )}
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
                    onClick={() => {
                      if (editingClientId !== client.id) {
                        console.log('🖱️ Cliente O365 clicado:', client);
                        onClientClick(client);
                      }
                    }}
                  >
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white">
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          value={editingData.clientName}
                          onChange={(e) => setEditingData({ ...editingData, clientName: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-blue-500 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        client.clientName
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {editingClientId === client.id ? (
                        <input
                          type="email"
                          value={editingData.contactEmail}
                          onChange={(e) => setEditingData({ ...editingData, contactEmail: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-blue-500 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        client.contactEmail || 'N/A'
                      )}
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
                    {isAdmin && (
                      <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center">
                        {editingClientId === client.id ? (
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleSaveEdit(e, client.id)}
                              disabled={isSaving}
                              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              title="Salvar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleEditClick(e, client)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-gray-500 dark:text-gray-400">
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