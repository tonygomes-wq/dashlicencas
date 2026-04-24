import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import DashboardHome from './DashboardHome';

// Import existing page components
import BitdefenderTable from '../components/BitdefenderTable';
import FortigateTable from '../components/FortigateTable';
import O365ClientTable from '../components/O365ClientTable';
import GmailClientTable from '../components/GmailClientTable';
import NetworkMapSubTab from '../components/NetworkMapSubTab';
import HardwareInventoryTable from '../components/HardwareInventoryTable';

// Import modals and other components
import AddBitdefenderModal from '../components/AddBitdefenderModal';
import AddFortigateModal from '../components/AddFortigateModal';
import AddO365ClientModal from '../components/AddO365ClientModal';
import AddGmailClientModal from '../components/AddGmailClientModal';
import AddHardwareModal from '../components/AddHardwareModal';
import DetailSidebar from '../components/DetailSidebar';
import O365DetailModal from '../components/O365DetailModal';
import GmailDetailModal from '../components/GmailDetailModal';
import HardwareDetailModal from '../components/HardwareDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SendEmailModal from '../components/SendEmailModal';
import AlertModal from '../components/AlertModal';
import UserManagementModal from '../components/UserManagementModal';

import { 
  BitdefenderLicense, 
  FortigateDevice, 
  O365Client, 
  O365License, 
  GmailClient, 
  GmailLicense, 
  HardwareDevice,
  BitdefenderLicenseWithStatus,
  FortigateDeviceWithStatus,
  O365LicenseWithClient,
  GmailLicenseWithClient,
  HardwareWithWarrantyStatus,
  LicenseStatus,
  WarrantyStatus
} from '../types';

// Funções auxiliares para mapear entre snake_case (DB) e camelCase (JS)
const toCamelCase = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));

const transformKeys = (obj: any, transformer: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => transformKeys(v, transformer));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[transformer(key)] = transformKeys(obj[key], transformer);
      return result;
    }, {} as any);
  }
  return obj;
};

interface DashboardNewProps {
  user: User;
}

type ItemDetail = (BitdefenderLicense & { type: 'bitdefender' }) | (FortigateDevice & { type: 'fortigate' });

const DashboardNew: React.FC<DashboardNewProps> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  
  // Data states
  const [rawBitdefender, setRawBitdefender] = useState<BitdefenderLicense[]>([]);
  const [rawFortigate, setRawFortigate] = useState<FortigateDevice[]>([]);
  const [rawO365Clients, setRawO365Clients] = useState<O365Client[]>([]);
  const [rawO365Licenses, setRawO365Licenses] = useState<O365License[]>([]);
  const [rawGmailClients, setRawGmailClients] = useState<GmailClient[]>([]);
  const [rawGmailLicenses, setRawGmailLicenses] = useState<GmailLicense[]>([]);
  const [rawHardware, setRawHardware] = useState<HardwareDevice[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Modal states
  const [isAddBitdefenderOpen, setIsAddBitdefenderOpen] = useState(false);
  const [isAddFortigateOpen, setIsAddFortigateOpen] = useState(false);
  const [isAddO365ClientOpen, setIsAddO365ClientOpen] = useState(false);
  const [isAddGmailClientOpen, setIsAddGmailClientOpen] = useState(false);
  const [isAddHardwareOpen, setIsAddHardwareOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [detailItem, setDetailItem] = useState<ItemDetail | null>(null);
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);

  const [o365DetailClient, setO365DetailClient] = useState<O365Client | null>(null);
  const [gmailDetailClient, setGmailDetailClient] = useState<GmailClient | null>(null);
  const [hardwareDetailDevice, setHardwareDetailDevice] = useState<HardwareDevice | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'hardware' | null;
    ids: number[];
  }>({ isOpen: false, type: null, ids: [] });

  const [sendEmailModal, setSendEmailModal] = useState<{
    isOpen: boolean;
    type: 'bitdefender' | 'fortigate' | null;
    itemId: number | null;
  }>({ isOpen: false, type: null, itemId: null });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  // Process data with status
  const processedBitdefender: BitdefenderLicenseWithStatus[] = rawBitdefender.map(license => {
    const expirationDate = license.expirationDate ? new Date(license.expirationDate) : null;
    const today = new Date();
    const remainingDays = expirationDate ? Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    let status: LicenseStatus;
    if (remainingDays < 0) status = LicenseStatus.Vencido;
    else if (remainingDays === 0) status = LicenseStatus.VenceHoje;
    else if (remainingDays <= 7) status = LicenseStatus.VenceEm7Dias;
    else status = LicenseStatus.OK;

    return { ...license, remainingDays, status };
  });

  const processedFortigate: FortigateDeviceWithStatus[] = rawFortigate.map(device => {
    const expirationDate = device.vencimento ? new Date(device.vencimento) : null;
    const today = new Date();
    const remainingDays = expirationDate ? Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    let status: LicenseStatus;
    if (remainingDays < 0) status = LicenseStatus.Vencido;
    else if (remainingDays === 0) status = LicenseStatus.VenceHoje;
    else if (remainingDays <= 7) status = LicenseStatus.VenceEm7Dias;
    else status = LicenseStatus.OK;

    return { ...device, remainingDays, status };
  });

  const processedO365Licenses: O365LicenseWithClient[] = rawO365Licenses.map(license => {
    const client = rawO365Clients.find(c => c.id === license.clientId);
    return { ...license, clientName: client?.clientName || 'Cliente não encontrado' };
  });

  const processedGmailLicenses: GmailLicenseWithClient[] = rawGmailLicenses.map(license => {
    const client = rawGmailClients.find(c => c.id === license.clientId);
    return { ...license, clientName: client?.clientName || 'Cliente não encontrado' };
  });

  const processedHardware: HardwareWithWarrantyStatus[] = rawHardware.map(device => {
    const warrantyDate = device.warrantyExpiration ? new Date(device.warrantyExpiration) : null;
    const today = new Date();
    const warrantyDaysRemaining = warrantyDate ? Math.ceil((warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : -999;
    
    let warrantyStatus: WarrantyStatus;
    if (warrantyDaysRemaining < 0) warrantyStatus = 'Expirada';
    else if (warrantyDaysRemaining <= 30) warrantyStatus = 'Expira em 30 dias';
    else warrantyStatus = 'Válida';

    return { ...device, warrantyDaysRemaining, warrantyStatus };
  });

  const isAdmin = user.role === 'admin';

  const handleSelectionChange = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRowClick = (item: BitdefenderLicenseWithStatus | FortigateDeviceWithStatus) => {
    if ('company' in item) {
      setDetailItem({ ...item, type: 'bitdefender' });
    } else {
      setDetailItem({ ...item, type: 'fortigate' });
    }
    setIsDetailSidebarOpen(true);
  };

  const handleUpdateO365License = async (id: number, data: Partial<O365License>) => {
    try {
      await apiClient.o365.licenses.update(id, data);
      await fetchAllData();
      toast.success('Licença atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar licença:', error);
      toast.error('Erro ao atualizar licença');
    }
  };

  const handleDeleteHardware = async (id: number) => {
    try {
      await apiClient.hardware.remove(id);
      await fetchAllData();
      toast.success('Hardware deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar hardware:', error);
      toast.error('Erro ao deletar hardware');
    }
  };

  const handleO365ClientClick = (client: O365Client) => {
    console.log('📋 Abrindo modal O365 para cliente:', client);
    setO365DetailClient(client);
  };

  const handleGmailClientClick = (client: GmailClient) => {
    console.log('📋 Abrindo modal Gmail para cliente:', client);
    setGmailDetailClient(client);
  };

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [bitdefenderData, fortigateData, o365ClientsData, o365LicensesData, gmailClientsData, gmailLicensesData, hardwareData] = await Promise.all([
        apiClient.bitdefender.list(),
        apiClient.fortigate.list(),
        apiClient.o365.clients.list(),
        apiClient.o365.licenses.list(),
        apiClient.gmail.clients.list(),
        apiClient.gmail.licenses.list(),
        apiClient.hardware.list()
      ]);

      console.log('📊 Dados carregados:', {
        bitdefender: bitdefenderData?.length || 0,
        fortigate: fortigateData?.length || 0,
        o365Clients: o365ClientsData?.length || 0,
        o365Licenses: o365LicensesData?.length || 0,
        gmailClients: gmailClientsData?.length || 0,
        gmailLicenses: gmailLicensesData?.length || 0,
        hardware: hardwareData?.length || 0
      });

      setRawBitdefender(transformKeys(bitdefenderData, toCamelCase));
      setRawFortigate(transformKeys(fortigateData, toCamelCase));
      setRawO365Clients(transformKeys(o365ClientsData, toCamelCase));
      setRawO365Licenses(transformKeys(o365LicensesData, toCamelCase));
      setRawGmailClients(transformKeys(gmailClientsData, toCamelCase));
      setRawGmailLicenses(transformKeys(gmailLicensesData, toCamelCase));
      setRawHardware(transformKeys(hardwareData, toCamelCase));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    
    // Open settings modal if navigating to settings
    if (page === 'settings' && user.role === 'admin') {
      setIsUserManagementOpen(true);
    }
  };

  // Render current page content
  const renderPageContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigate} />;

      case 'bitdefender':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bitdefender - Gerenciamento de Licenças
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie todas as licenças Bitdefender
              </p>
            </div>
            <BitdefenderTable
              licenses={processedBitdefender}
              onRowClick={handleRowClick}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        );

      case 'fortigate':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Fortigate - Gerenciamento de Dispositivos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie todos os dispositivos Fortigate
              </p>
            </div>
            <FortigateTable
              devices={processedFortigate}
              onRowClick={handleRowClick}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        );

      case 'office365':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Office 365 - Gerenciamento de Licenças
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie clientes e licenças Office 365
              </p>
            </div>
            <O365ClientTable
              clients={rawO365Clients}
              licenses={processedO365Licenses}
              onLicenseUpdate={handleUpdateO365License}
              isAdmin={isAdmin}
              onClientClick={handleO365ClientClick}
            />
          </div>
        );

      case 'gmail':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gmail - Gerenciamento de Licenças
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie clientes e licenças Gmail
              </p>
            </div>
            <GmailClientTable
              clients={rawGmailClients}
              licenses={processedGmailLicenses}
              onClientClick={handleGmailClientClick}
            />
          </div>
        );

      case 'network':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mapa de Rede - Topologia e Diagramas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Crie e visualize diagramas de rede
              </p>
            </div>
            <NetworkMapSubTab />
          </div>
        );

      case 'inventory':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Inventário de Hardware
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie o inventário de dispositivos
              </p>
            </div>
            <HardwareInventoryTable
              devices={processedHardware}
              onRowClick={setHardwareDetailDevice}
              onDelete={isAdmin ? handleDeleteHardware : undefined}
              canEdit={isAdmin}
              canDelete={isAdmin}
            />
          </div>
        );

      case 'settings':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configurações
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie usuários e permissões do sistema
              </p>
            </div>
            {user.role === 'admin' && (
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gerenciar Usuários
              </button>
            )}
          </div>
        );

      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <MainLayout
      user={user}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPageContent()}

      {/* Modals */}
      {isAddBitdefenderOpen && (
        <AddBitdefenderModal
          onClose={() => setIsAddBitdefenderOpen(false)}
          onSuccess={() => {
            fetchAllData();
            setIsAddBitdefenderOpen(false);
          }}
        />
      )}

      {isAddFortigateOpen && (
        <AddFortigateModal
          onClose={() => setIsAddFortigateOpen(false)}
          onSuccess={() => {
            fetchAllData();
            setIsAddFortigateOpen(false);
          }}
        />
      )}

      {isAddO365ClientOpen && (
        <AddO365ClientModal
          onClose={() => setIsAddO365ClientOpen(false)}
          onSuccess={() => {
            fetchAllData();
            setIsAddO365ClientOpen(false);
          }}
        />
      )}

      {isAddGmailClientOpen && (
        <AddGmailClientModal
          onClose={() => setIsAddGmailClientOpen(false)}
          onSuccess={() => {
            fetchAllData();
            setIsAddGmailClientOpen(false);
          }}
        />
      )}

      {isAddHardwareOpen && (
        <AddHardwareModal
          onClose={() => setIsAddHardwareOpen(false)}
          onSuccess={() => {
            fetchAllData();
            setIsAddHardwareOpen(false);
          }}
        />
      )}

      {isDetailSidebarOpen && detailItem && (
        <DetailSidebar
          isOpen={isDetailSidebarOpen}
          onClose={() => setIsDetailSidebarOpen(false)}
          item={detailItem}
          onUpdate={async (id, data, type) => {
            try {
              if (type === 'bitdefender') {
                await apiClient.bitdefender.update(id, data);
              } else {
                await apiClient.fortigate.update(id, data);
              }
              await fetchAllData();
              toast.success('Atualizado com sucesso!');
              setIsDetailSidebarOpen(false);
            } catch (error) {
              toast.error('Erro ao atualizar');
            }
          }}
          isAdmin={user.role === 'admin'}
        />
      )}

      {o365DetailClient && (
        <>
          {console.log('🔵 Renderizando O365DetailModal para:', o365DetailClient)}
          <O365DetailModal
            client={o365DetailClient}
            licenses={processedO365Licenses.filter(l => l.clientId === o365DetailClient.id)}
            onClose={() => setO365DetailClient(null)}
            onUpdate={() => fetchAllData()}
            isAdmin={user.role === 'admin'}
          />
        </>
      )}

      {gmailDetailClient && (
        <>
          {console.log('🔴 Renderizando GmailDetailModal para:', gmailDetailClient)}
          <GmailDetailModal
            client={gmailDetailClient}
            licenses={processedGmailLicenses.filter(l => l.clientId === gmailDetailClient.id)}
            onClose={() => setGmailDetailClient(null)}
            onUpdate={() => fetchAllData()}
            isAdmin={user.role === 'admin'}
          />
        </>
      )}

      {hardwareDetailDevice && (
        <HardwareDetailModal
          device={hardwareDetailDevice}
          onClose={() => setHardwareDetailDevice(null)}
          onUpdate={() => fetchAllData()}
          isAdmin={user.role === 'admin'}
        />
      )}

      {isUserManagementOpen && user.role === 'admin' && (
        <UserManagementModal
          onClose={() => setIsUserManagementOpen(false)}
        />
      )}

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, type: null, ids: [] })}
          onConfirm={async () => {
            try {
              if (deleteConfirm.type === 'bitdefender') {
                await apiClient.bitdefender.deleteMultiple(deleteConfirm.ids);
              } else if (deleteConfirm.type === 'fortigate') {
                await apiClient.fortigate.deleteMultiple(deleteConfirm.ids);
              }
              await fetchAllData();
              toast.success('Deletado com sucesso!');
              setDeleteConfirm({ isOpen: false, type: null, ids: [] });
            } catch (error) {
              toast.error('Erro ao deletar');
            }
          }}
          itemCount={deleteConfirm.ids.length}
        />
      )}

      {sendEmailModal.isOpen && sendEmailModal.itemId && (
        <SendEmailModal
          isOpen={sendEmailModal.isOpen}
          onClose={() => setSendEmailModal({ isOpen: false, type: null, itemId: null })}
          itemId={sendEmailModal.itemId}
          productType={sendEmailModal.type!}
        />
      )}

      {alertModal.isOpen && (
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
          title={alertModal.title}
          message={alertModal.message}
        />
      )}
    </MainLayout>
  );
};

export default DashboardNew;
