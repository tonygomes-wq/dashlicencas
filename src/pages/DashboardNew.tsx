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

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [bitdefenderData, fortigateData, o365ClientsData, o365LicensesData, gmailClientsData, gmailLicensesData, hardwareData] = await Promise.all([
        apiClient.bitdefender.getAll(),
        apiClient.fortigate.getAll(),
        apiClient.o365.getClients(),
        apiClient.o365.getLicenses(),
        apiClient.gmail.getClients(),
        apiClient.gmail.getLicenses(),
        apiClient.hardware.getAll()
      ]);

      setRawBitdefender(bitdefenderData);
      setRawFortigate(fortigateData);
      setRawO365Clients(o365ClientsData);
      setRawO365Licenses(o365LicensesData);
      setRawGmailClients(gmailClientsData);
      setRawGmailLicenses(gmailLicensesData);
      setRawHardware(hardwareData);
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
              data={rawBitdefender}
              onAdd={() => setIsAddBitdefenderOpen(true)}
              onEdit={(item) => {
                setDetailItem({ ...item, type: 'bitdefender' });
                setIsDetailSidebarOpen(true);
              }}
              onDelete={(ids) => setDeleteConfirm({ isOpen: true, type: 'bitdefender', ids })}
              onSendEmail={(id) => setSendEmailModal({ isOpen: true, type: 'bitdefender', itemId: id })}
              isAdmin={user.role === 'admin'}
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
              data={rawFortigate}
              onAdd={() => setIsAddFortigateOpen(true)}
              onEdit={(item) => {
                setDetailItem({ ...item, type: 'fortigate' });
                setIsDetailSidebarOpen(true);
              }}
              onDelete={(ids) => setDeleteConfirm({ isOpen: true, type: 'fortigate', ids })}
              onSendEmail={(id) => setSendEmailModal({ isOpen: true, type: 'fortigate', itemId: id })}
              isAdmin={user.role === 'admin'}
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
              licenses={rawO365Licenses}
              onAddClient={() => setIsAddO365ClientOpen(true)}
              onViewClient={(client) => setO365DetailClient(client)}
              onDeleteClient={(id) => setDeleteConfirm({ isOpen: true, type: 'o365', ids: [parseInt(id)] })}
              isAdmin={user.role === 'admin'}
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
              licenses={rawGmailLicenses}
              onAddClient={() => setIsAddGmailClientOpen(true)}
              onViewClient={(client) => setGmailDetailClient(client)}
              onDeleteClient={(id) => setDeleteConfirm({ isOpen: true, type: 'gmail', ids: [parseInt(id)] })}
              isAdmin={user.role === 'admin'}
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
              data={rawHardware}
              onAdd={() => setIsAddHardwareOpen(true)}
              onEdit={(device) => setHardwareDetailDevice(device)}
              onDelete={(ids) => setDeleteConfirm({ isOpen: true, type: 'hardware', ids })}
              isAdmin={user.role === 'admin'}
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
        <O365DetailModal
          client={o365DetailClient}
          licenses={rawO365Licenses.filter(l => l.clientId === o365DetailClient.id)}
          onClose={() => setO365DetailClient(null)}
          onUpdate={() => fetchAllData()}
          isAdmin={user.role === 'admin'}
        />
      )}

      {gmailDetailClient && (
        <GmailDetailModal
          client={gmailDetailClient}
          licenses={rawGmailLicenses.filter(l => l.clientId === gmailDetailClient.id)}
          onClose={() => setGmailDetailClient(null)}
          onUpdate={() => fetchAllData()}
          isAdmin={user.role === 'admin'}
        />
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
