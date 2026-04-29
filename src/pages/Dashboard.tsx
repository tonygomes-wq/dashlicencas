import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import BitdefenderTable from '../components/BitdefenderTable';
import FortigateTable from '../components/FortigateTable';
import O365ClientTable from '../components/O365ClientTable';
import GmailClientTable from '../components/GmailClientTable'; // Novo Import
import NetworkMapSubTab from '../components/NetworkMapSubTab'; // Novo Import
import HardwareInventoryTable from '../components/HardwareInventoryTable'; // Hardware Import
import AddHardwareModal from '../components/AddHardwareModal'; // Hardware Import
import HardwareDetailModal from '../components/HardwareDetailModal'; // Hardware Import
import AlertModal from '../components/AlertModal';
import AddBitdefenderModal from '../components/AddBitdefenderModal';
import AddFortigateModal from '../components/AddFortigateModal';
import AddO365ClientModal from '../components/AddO365ClientModal';
import AddGmailClientModal from '../components/AddGmailClientModal'; // Novo Import
import SendEmailModal from '../components/SendEmailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DetailSidebar from '../components/DetailSidebar';
import O365DetailModal from '../components/O365DetailModal';
import GmailDetailModal from '../components/GmailDetailModal'; // Novo Import
import { BitdefenderLicense, FortigateDevice, LicenseStatus, BitdefenderLicenseWithStatus, FortigateDeviceWithStatus, RenewalStatus, O365Client, O365License, O365LicenseWithClient, GmailClient, GmailLicense, GmailLicenseWithClient, HardwareDevice, HardwareWithWarrantyStatus, WarrantyStatus } from '../types'; // Tipos GMAIL e Hardware adicionados
import MfaEnrollment from '../components/MfaEnrollment';
import UserManagementModal from '../components/UserManagementModal';
import { Shield, Router, LoaderCircle, Briefcase, Mail, Network, HardDrive } from 'lucide-react'; // Mail icon for GMAIL tab, Network for Map, HardDrive for Hardware
import { apiClient } from '../lib/apiClient';
import { User } from '../types';
import toast from 'react-hot-toast';

interface DashboardProps {
  user: User;
}

type ItemDetail = (BitdefenderLicense & { type: 'bitdefender' }) | (FortigateDevice & { type: 'fortigate' });

// Funções auxiliares para mapear entre snake_case (DB) e camelCase (JS)
const toCamelCase = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
const toSnakeCase = (s: string) => s.replace(/[A-Z]/g, (letter, index) => {
  return index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
});

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


const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const [activeView, setActiveView] = useState<'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware'>(() => {
    if (user.role === 'admin') return 'bitdefender';
    if (user.permissions?.dashboards.bitdefender) return 'bitdefender';
    if (user.permissions?.dashboards.fortigate) return 'fortigate';
    if (user.permissions?.dashboards.o365) return 'o365';
    if (user.permissions?.dashboards.gmail) return 'gmail';
    if (user.permissions?.dashboards.network) return 'network';
    return 'bitdefender';
  });

  const [rawBitdefender, setRawBitdefender] = useState<BitdefenderLicense[]>([]);
  const [rawFortigate, setRawFortigate] = useState<FortigateDevice[]>([]);
  const [rawO365Clients, setRawO365Clients] = useState<O365Client[]>([]);
  const [rawO365Licenses, setRawO365Licenses] = useState<O365License[]>([]);
  const [rawGmailClients, setRawGmailClients] = useState<GmailClient[]>([]); // Novo Estado
  const [rawGmailLicenses, setRawGmailLicenses] = useState<GmailLicense[]>([]); // Novo Estado
  const [rawHardware, setRawHardware] = useState<HardwareDevice[]>([]); // Hardware Estado

  const [isLoading, setIsLoading] = useState(true);

  const [processedBitdefender, setProcessedBitdefender] = useState<BitdefenderLicenseWithStatus[]>([]);
  const [processedFortigate, setProcessedFortigate] = useState<FortigateDeviceWithStatus[]>([]);
  const [processedHardware, setProcessedHardware] = useState<HardwareWithWarrantyStatus[]>([]);

  const [filteredBitdefender, setFilteredBitdefender] = useState<BitdefenderLicenseWithStatus[]>([]);
  const [filteredFortigate, setFilteredFortigate] = useState<FortigateDeviceWithStatus[]>([]);
  const [filteredHardware, setFilteredHardware] = useState<HardwareWithWarrantyStatus[]>([]);

  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Estado para o painel lateral de detalhes (Bitdefender/Fortigate)
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<ItemDetail | null>(null);

  // Novo estado para o modal de detalhes O365
  const [isO365DetailModalOpen, setIsO365DetailModalOpen] = useState(false);
  const [selectedO365Client, setSelectedO365Client] = useState<O365Client | null>(null);

  // Novo estado para o modal de detalhes GMAIL
  const [isGmailDetailModalOpen, setIsGmailDetailModalOpen] = useState(false);
  const [selectedGmailClient, setSelectedGmailClient] = useState<GmailClient | null>(null);

  // Estado para o modal de detalhes Hardware
  const [isHardwareDetailModalOpen, setIsHardwareDetailModalOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState<HardwareWithWarrantyStatus | null>(null);

  // Novo estado para o modal 2FA
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

  // Novo estado para o modal de gerenciamento de usuários
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);

  // Novo estado para o modal 2FA
  const isAdmin = useMemo(() => user.role === 'admin', [user.role]);
  const canEdit = useMemo(() => isAdmin || user.permissions?.actions.edit, [isAdmin, user.permissions]);
  const canDelete = useMemo(() => isAdmin || user.permissions?.actions.delete, [isAdmin, user.permissions]);

  const calculateStatus = useCallback(<T extends Partial<{ expirationDate: string | null, vencimento: string | null } & BaseItem>>(items: T[]): (T & { remainingDays: number; status: LicenseStatus; })[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.map(item => {
      const dateString = item.expirationDate || item.vencimento;
      if (!dateString) {
        return { ...item, remainingDays: 9999, status: LicenseStatus.OK };
      }
      const expirationDate = new Date(dateString + 'T00:00:00');
      const timeDiff = expirationDate.getTime() - today.getTime();
      const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let status: LicenseStatus;
      if (remainingDays < 0) status = LicenseStatus.Vencido;
      else if (remainingDays === 0) status = LicenseStatus.VenceHoje;
      else if (remainingDays <= 7) status = LicenseStatus.VenceEm7Dias;
      else status = LicenseStatus.OK;

      return { ...item, remainingDays, status };
    });
  }, []);

  const checkAndAutoUpdateRenewalStatus = useCallback(async (
    processedItems: (BitdefenderLicenseWithStatus | FortigateDeviceWithStatus)[],
    tableName: string,
    setRawData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const itemsToUpdate = processedItems.filter(item =>
      item.status === LicenseStatus.OK && item.renewalStatus === 'Pendente'
    );

    if (itemsToUpdate.length === 0) return;

    console.log(`Atualizando ${itemsToUpdate.length} registros em ${tableName} para 'Renovado' automaticamente.`);

    // Coleta IDs para atualização em lote
    const idsToUpdate = itemsToUpdate.map(item => item.id);

    try {
      const client = tableName === 'bitdefender_licenses' ? apiClient.bitdefender : apiClient.fortigate;

      // Update one by one or implement bulk update in PHP
      for (const id of idsToUpdate) {
        await client.update(id, { renewal_status: 'Renovado' });
      }

      // Atualiza o estado local para refletir a mudança
      setRawData(prev => prev.map(item => {
        if (idsToUpdate.includes(item.id)) {
          return { ...item, renewalStatus: 'Renovado' as RenewalStatus };
        }
        return item;
      }));

    } catch (error) {
      console.error(`Erro na atualização automática de ${tableName}:`, error);
    }
  }, []);

  useEffect(() => {
    const processed = calculateStatus(rawBitdefender);
    setProcessedBitdefender(processed);
    // Verifica e atualiza o status de renovação automaticamente
    checkAndAutoUpdateRenewalStatus(processed, 'bitdefender_licenses', setRawBitdefender);
  }, [rawBitdefender, calculateStatus, checkAndAutoUpdateRenewalStatus]);

  useEffect(() => {
    const processed = calculateStatus(rawFortigate);
    setProcessedFortigate(processed);
    // Verifica e atualiza o status de renovação automaticamente
    checkAndAutoUpdateRenewalStatus(processed, 'fortigate_devices', setRawFortigate);
  }, [rawFortigate, calculateStatus, checkAndAutoUpdateRenewalStatus]);

  // Processa hardware com status de garantia
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processed = rawHardware.map(device => {
      let warrantyDaysRemaining = 9999;
      let warrantyStatus: WarrantyStatus = 'Válida';

      if (device.warrantyExpiration) {
        const warrantyDate = new Date(device.warrantyExpiration + 'T00:00:00');
        const timeDiff = warrantyDate.getTime() - today.getTime();
        warrantyDaysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (warrantyDaysRemaining < 0) {
          warrantyStatus = 'Expirada';
        } else if (warrantyDaysRemaining <= 30) {
          warrantyStatus = 'Expira em 30 dias';
        } else {
          warrantyStatus = 'Válida';
        }
      }

      return {
        ...device,
        warrantyDaysRemaining,
        warrantyStatus
      };
    });

    setProcessedHardware(processed);
  }, [rawHardware]);

  // Combina licenças O365 com nome do cliente
  const processedO365Licenses = useMemo<O365LicenseWithClient[]>(() => {
    const clientMap = new Map(rawO365Clients.map(c => [c.id, c.clientName]));
    return rawO365Licenses.map(license => ({
      ...license,
      clientName: clientMap.get(license.clientId) || 'Cliente Desconhecido'
    }));
  }, [rawO365Clients, rawO365Licenses]);

  // Combina licenças GMAIL com nome do cliente (Novo)
  const processedGmailLicenses = useMemo<GmailLicenseWithClient[]>(() => {
    const clientMap = new Map(rawGmailClients.map(c => [c.id, c.clientName]));
    return rawGmailLicenses.map(license => ({
      ...license,
      clientName: clientMap.get(license.clientId) || 'Cliente Desconhecido'
    }));
  }, [rawGmailClients, rawGmailLicenses]);

  // Filtra clientes O365
  const filteredO365Clients = useMemo(() => {
    if (!companyFilter) return rawO365Clients;
    return rawO365Clients.filter(client =>
      client.clientName.toLowerCase().includes(companyFilter.toLowerCase())
    );
  }, [rawO365Clients, companyFilter]);

  // Filtra clientes GMAIL (Novo)
  const filteredGmailClients = useMemo(() => {
    if (!companyFilter) return rawGmailClients;
    return rawGmailClients.filter(client =>
      client.clientName.toLowerCase().includes(companyFilter.toLowerCase())
    );
  }, [rawGmailClients, companyFilter]);


  useEffect(() => {
    if (isLoading) return;
    const hasUrgentBitdefender = processedBitdefender.some(c => c.remainingDays <= 7);
    const hasUrgentFortigate = processedFortigate.some(d => d.remainingDays <= 7);
    if ((hasUrgentBitdefender || hasUrgentFortigate) && (processedBitdefender.length > 0 || processedFortigate.length > 0)) {
      setShowAlertModal(true);
    }
  }, [processedBitdefender, processedFortigate, isLoading]);

  const urgentCount = useMemo(() => {
    const bitdefenderUrgents = processedBitdefender.filter(c => c.remainingDays <= 15).length;
    const fortigateUrgents = processedFortigate.filter(d => d.remainingDays <= 15).length;
    return bitdefenderUrgents + fortigateUrgents;
  }, [processedBitdefender, processedFortigate]);

  const expiredClients = useMemo(() => {
    const bitdefenderExpired = processedBitdefender
      .filter(c => c.status === LicenseStatus.Vencido)
      .map(c => c.company);

    const fortigateExpired = processedFortigate
      .filter(d => d.status === LicenseStatus.Vencido)
      .map(d => d.client);

    return [...new Set([...bitdefenderExpired, ...fortigateExpired])];
  }, [processedBitdefender, processedFortigate]);

  useEffect(() => {
    const filterData = <T extends BitdefenderLicenseWithStatus | FortigateDeviceWithStatus>(data: T[], nameSelector: (item: T) => string) => {
      let result = [...data];
      if (showOnlyUrgent) result = result.filter(item => item.remainingDays <= 15);
      if (companyFilter) result = result.filter(item => nameSelector(item).toLowerCase().includes(companyFilter.toLowerCase()));
      if (statusFilter !== 'all') {
        if (statusFilter === 'VENCIDO') result = result.filter(item => item.status === LicenseStatus.Vencido);
        else if (statusFilter === 'PROXIMO') result = result.filter(item => [LicenseStatus.VenceHoje, LicenseStatus.VenceEm7Dias].includes(item.status) || (item.remainingDays > 7 && item.remainingDays <= 15));
        else if (statusFilter === 'OK') result = result.filter(item => item.status === LicenseStatus.OK);
      }
      result.sort((a, b) => a.remainingDays - b.remainingDays);
      return result;
    };

    setFilteredBitdefender(filterData<BitdefenderLicenseWithStatus>(processedBitdefender, item => item.company));
    setFilteredFortigate(filterData<FortigateDeviceWithStatus>(processedFortigate, item => item.client));

    // Filtro para hardware
    let hardwareResult = [...processedHardware];
    if (companyFilter) {
      hardwareResult = hardwareResult.filter(device => 
        device.clientName.toLowerCase().includes(companyFilter.toLowerCase()) ||
        device.deviceName.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'VENCIDO') hardwareResult = hardwareResult.filter(device => device.warrantyStatus === 'Expirada');
      else if (statusFilter === 'PROXIMO') hardwareResult = hardwareResult.filter(device => device.warrantyStatus === 'Expira em 30 dias');
      else if (statusFilter === 'OK') hardwareResult = hardwareResult.filter(device => device.warrantyStatus === 'Válida');
    }
    hardwareResult.sort((a, b) => a.warrantyDaysRemaining - b.warrantyDaysRemaining);
    setFilteredHardware(hardwareResult);
  }, [processedBitdefender, processedFortigate, processedHardware, companyFilter, statusFilter, showOnlyUrgent]);

  const loadDataFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        bitdefenderData,
        fortigateData,
        o365ClientsData,
        o365LicensesData,
        gmailClientsData,
        gmailLicensesData,
        hardwareData
      ] = await Promise.all([
        apiClient.bitdefender.list(),
        apiClient.fortigate.list(),
        apiClient.o365.clients.list(),
        apiClient.o365.licenses.list(),
        apiClient.gmail.clients.list(),
        apiClient.gmail.licenses.list(),
        apiClient.hardware.list()
      ]);

      setRawBitdefender(transformKeys(bitdefenderData, toCamelCase));
      setRawFortigate(transformKeys(fortigateData, toCamelCase));
      setRawO365Clients(transformKeys(o365ClientsData, toCamelCase));
      setRawO365Licenses(transformKeys(o365LicensesData, toCamelCase));
      setRawGmailClients(transformKeys(gmailClientsData, toCamelCase));
      setRawGmailLicenses(transformKeys(gmailLicensesData, toCamelCase));
      setRawHardware(transformKeys(hardwareData, toCamelCase));
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSync = () => {
    const toastId = toast.loading('Sincronizando dados...');
    loadDataFromApi().then(() => {
      toast.success('Dados sincronizados!', { id: toastId });
    });
  };

  useEffect(() => {
    loadDataFromApi();
  }, [loadDataFromApi]);

  // Realtime foi removido temporariamente na migração para MySQL. 
  // O usuário pode usar o botão de Sincronizar para atualizar os dados.


  const handleUpdateRecord = async (
    tableName: string,
    id: number,
    data: Partial<BitdefenderLicense> | Partial<FortigateDevice>
  ) => {
    const toastId = toast.loading('Salvando alterações...');
    try {
      const snakeCaseData = transformKeys(data, toSnakeCase);
      const client = tableName === 'bitdefender_licenses' ? apiClient.bitdefender : apiClient.fortigate;

      const updatedData = await client.update(id, snakeCaseData);

      const camelCaseUpdatedData = transformKeys(updatedData, toCamelCase);
      if (tableName === 'bitdefender_licenses') {
        setRawBitdefender(prev => prev.map(item => item.id === id ? camelCaseUpdatedData : item));
      } else {
        setRawFortigate(prev => prev.map(item => item.id === id ? camelCaseUpdatedData : item));
      }

      toast.success('Alterações salvas com sucesso!', { id: toastId });
      return true;

    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar.', { id: toastId, duration: 6000 });
      loadDataFromApi();
      return false;
    }
  };

  const handleUpdateO365License = async (id: number, data: Partial<O365License>) => {
    const toastId = toast.loading('Salvando licença O365...');
    try {
      const snakeCaseData = transformKeys(data, toSnakeCase);
      const updatedData = await apiClient.o365.licenses.update(id, snakeCaseData);
      const camelCaseUpdatedData = transformKeys(updatedData, toCamelCase);
      setRawO365Licenses(prev => prev.map(item => item.id === id ? camelCaseUpdatedData : item));
      toast.success('Licença O365 atualizada com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar O365.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  const handleRemoveO365License = async (id: number) => {
    const toastId = toast.loading('Removendo licença O365...');
    try {
      await apiClient.o365.licenses.remove(id);
      setRawO365Licenses(prev => prev.filter(item => item.id !== id));
      toast.success('Licença O365 removida com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover licença O365.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  // Novo: Handler para atualizar licença GMAIL
  const handleUpdateGmailLicense = async (id: number, data: Partial<GmailLicense>) => {
    const toastId = toast.loading('Salvando licença GMAIL...');
    try {
      const snakeCaseData = transformKeys(data, toSnakeCase);
      const updatedData = await apiClient.gmail.licenses.update(id, snakeCaseData);
      const camelCaseUpdatedData = transformKeys(updatedData, toCamelCase);
      setRawGmailLicenses(prev => prev.map(item => item.id === id ? camelCaseUpdatedData : item));
      toast.success('Licença GMAIL atualizada com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar GMAIL.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  const handleRemoveGmailLicense = async (id: number) => {
    const toastId = toast.loading('Removendo licença GMAIL...');
    try {
      await apiClient.gmail.licenses.remove(id);
      setRawGmailLicenses(prev => prev.filter(item => item.id !== id));
      toast.success('Licença GMAIL removida com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover licença GMAIL.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  const handleAddO365License = async (
    clientId: string,
    licenseData: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>
  ) => {
    const toastId = toast.loading('Adicionando nova licença O365...');
    try {
      const dataToInsert = {
        ...transformKeys(licenseData, toSnakeCase),
        client_id: clientId,
        renewal_status: 'Pendente',
      };

      const newLicense = await apiClient.o365.licenses.create(dataToInsert);
      const newLicenseCamel = transformKeys(newLicense, toCamelCase);
      setRawO365Licenses(prev => [...prev, newLicenseCamel]);
      toast.success('Licença O365 adicionada com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar O365.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  // Novo: Handler para adicionar licença GMAIL
  const handleAddGmailLicense = async (
    clientId: string,
    licenseData: Omit<GmailLicense, 'id' | 'clientId' | 'renewalStatus'>
  ) => {
    const toastId = toast.loading('Adicionando nova licença GMAIL...');
    try {
      const dataToInsert = {
        ...transformKeys(licenseData, toSnakeCase),
        client_id: clientId,
        renewal_status: 'Pendente',
      };

      const newLicense = await apiClient.gmail.licenses.create(dataToInsert);
      const newLicenseCamel = transformKeys(newLicense, toCamelCase);
      setRawGmailLicenses(prev => [...prev, newLicenseCamel]);
      toast.success('Licença GMAIL adicionada com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar GMAIL.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  const handleBulkImportO365Licenses = async (
    clientId: string,
    licenses: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[]
  ) => {
    const toastId = toast.loading(`Preparando para importar ${licenses.length} licenças O365...`);
    try {
      const licensesToInsert = licenses.map(l => ({
        ...transformKeys(l, toSnakeCase),
        client_id: clientId,
        user_id: user.id,
        renewal_status: 'Pendente',
      }));

      const newLicenses = await apiClient.o365.licenses.bulkCreate(licensesToInsert);
      const newLicensesCamel = transformKeys(newLicenses, toCamelCase);
      setRawO365Licenses(prev => [...prev, ...newLicensesCamel]);
      toast.success(`${newLicensesCamel.length} licenças O365 importadas com sucesso!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar licenças O365.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  // Novo: Handler para importação em massa GMAIL
  const handleBulkImportGmailLicenses = async (
    clientId: string,
    licenses: Omit<GmailLicense, 'id' | 'clientId' | 'renewalStatus'>[]
  ) => {
    const toastId = toast.loading(`Preparando para importar ${licenses.length} licenças GMAIL...`);
    try {
      const licensesToInsert = licenses.map(l => ({
        ...transformKeys(l, toSnakeCase),
        client_id: clientId,
        user_id: user.id,
        renewal_status: 'Pendente',
      }));

      const newLicenses = await apiClient.gmail.licenses.bulkCreate(licensesToInsert);
      const newLicensesCamel = transformKeys(newLicenses, toCamelCase);
      setRawGmailLicenses(prev => [...prev, ...newLicensesCamel]);
      toast.success(`${newLicensesCamel.length} licenças GMAIL importadas com sucesso!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar licenças GMAIL.', { id: toastId, duration: 6000 });
      loadDataFromApi();
    }
  };

  const handleUpdateFromSidebar = async (id: number, data: Partial<BitdefenderLicense | FortigateDevice>, type: 'bitdefender' | 'fortigate') => {
    console.log('🟡 handleUpdateFromSidebar (Dashboard) chamado:', { id, data, type });
    const tableName = type === 'bitdefender' ? 'bitdefender_licenses' : 'fortigate_devices';
    const success = await handleUpdateRecord(tableName, id, data);
    console.log('🟡 handleUpdateRecord retornou:', success);
    if (success) {
      console.log('🟡 Fechando modal...');
      // Fechar o modal após salvar
      setIsDetailSidebarOpen(false);
      console.log('🟡 Modal fechado!');
      // Se a atualização for bem-sucedida, atualiza o item selecionado no sidebar
      setSelectedItemDetail(prev => {
        if (!prev) return null;
        return { ...prev, ...data } as ItemDetail;
      });
    }
  };

  const handleAddBitdefender = async (data: Omit<BitdefenderLicense, 'id'>) => {
    const toastId = toast.loading('Adicionando nova licença...');
    try {
      const newRecord = await apiClient.bitdefender.create(transformKeys(data, toSnakeCase));
      setRawBitdefender(prev => [...prev, transformKeys(newRecord, toCamelCase)]);
      toast.success('Licença adicionada com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar.', { id: toastId, duration: 6000 });
    }
  };

  const handleAddFortigate = async (data: Omit<FortigateDevice, 'id'>) => {
    const toastId = toast.loading('Adicionando novo dispositivo...');
    try {
      const newRecord = await apiClient.fortigate.create(transformKeys(data, toSnakeCase));
      setRawFortigate(prev => [...prev, transformKeys(newRecord, toCamelCase)]);
      toast.success('Dispositivo adicionado com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar.', { id: toastId, duration: 6000 });
    }
  };

  const handleAddO365Client = async (
    clientData: Omit<O365Client, 'id'>,
    licenses: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[]
  ) => {
    const toastId = toast.loading('Adicionando cliente e licenças O365...');
    try {
      const clientToInsert = { ...transformKeys(clientData, toSnakeCase), user_id: user.id };
      const licensesToInsert = licenses.map(l => ({
        ...transformKeys(l, toSnakeCase),
        user_id: user.id,
        renewal_status: 'Pendente',
      }));

      const response = await apiClient.o365.clients.createWithLicenses(clientToInsert, licensesToInsert);
      const newClientCamel = transformKeys(response.client, toCamelCase);
      const newLicensesCamel = transformKeys(response.licenses, toCamelCase);

      setRawO365Clients(prev => [...prev, newClientCamel]);
      setRawO365Licenses(prev => [...prev, ...newLicensesCamel]);
      toast.success('Cliente e licenças O365 adicionados com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar cliente O365.', { id: toastId, duration: 6000 });
    }
  };

  // Novo: Handler para adicionar cliente GMAIL
  const handleAddGmailClient = async (
    clientData: Omit<GmailClient, 'id'>,
    licenses: Omit<GmailLicense, 'id' | 'clientId' | 'renewalStatus'>[]
  ) => {
    const toastId = toast.loading('Adicionando cliente e licenças GMAIL...');
    try {
      const clientToInsert = { ...transformKeys(clientData, toSnakeCase), user_id: user.id };
      const licensesToInsert = licenses.map(l => ({
        ...transformKeys(l, toSnakeCase),
        user_id: user.id,
        renewal_status: 'Pendente',
      }));

      const response = await apiClient.gmail.clients.createWithLicenses(clientToInsert, licensesToInsert);
      const newClientCamel = transformKeys(response.client, toCamelCase);
      const newLicensesCamel = transformKeys(response.licenses, toCamelCase);

      setRawGmailClients(prev => [...prev, newClientCamel]);
      setRawGmailLicenses(prev => [...prev, ...newLicensesCamel]);
      toast.success('Cliente e licenças GMAIL adicionados com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar cliente GMAIL.', { id: toastId, duration: 6000 });
    }
  };

  // Hardware Handlers
  const handleAddHardware = async (device: Omit<HardwareDevice, 'id' | 'lastUpdate' | 'userId'>) => {
    const toastId = toast.loading('Adicionando dispositivo...');
    try {
      const dataToInsert = transformKeys(device, toSnakeCase);
      const newDevice = await apiClient.hardware.create(dataToInsert);
      const newDeviceCamel = transformKeys(newDevice, toCamelCase);
      setRawHardware(prev => [...prev, newDeviceCamel]);
      toast.success('Dispositivo adicionado com sucesso!', { id: toastId });
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar dispositivo.', { id: toastId, duration: 6000 });
    }
  };

  const handleUpdateHardware = async (id: number, data: Partial<HardwareDevice>) => {
    const toastId = toast.loading('Atualizando dispositivo...');
    try {
      const snakeCaseData = transformKeys(data, toSnakeCase);
      const updatedDevice = await apiClient.hardware.update(id, snakeCaseData);
      const updatedDeviceCamel = transformKeys(updatedDevice, toCamelCase);
      setRawHardware(prev => prev.map(item => item.id === id ? updatedDeviceCamel : item));
      toast.success('Dispositivo atualizado com sucesso!', { id: toastId });
      setIsHardwareDetailModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar dispositivo.', { id: toastId, duration: 6000 });
    }
  };

  const handleDeleteHardware = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este dispositivo?')) return;
    
    const toastId = toast.loading('Removendo dispositivo...');
    try {
      await apiClient.hardware.remove(id);
      setRawHardware(prev => prev.filter(item => item.id !== id));
      toast.success('Dispositivo removido com sucesso!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover dispositivo.', { id: toastId, duration: 6000 });
    }
  };

  const handleHardwareRowClick = (device: HardwareWithWarrantyStatus) => {
    setSelectedHardware(device);
    setIsHardwareDetailModalOpen(true);
  };

  const handleSendCustomEmail = async (payload: { itemIds: string[]; subject: string; body: string }) => {
    const toastId = toast.loading(`Enviando ${payload.itemIds.length} e-mail(s)...`);
    try {
      const data = await apiClient.sendEmails.send(payload);
      toast.success(data.message || 'Processo de envio concluído!', { id: toastId, duration: 6000 });
      setSelectedItems(new Set());
    } catch (error: any) {
      console.error("Error sending custom emails:", error);
      toast.error(error.message || 'Erro ao enviar emails.', { id: toastId, duration: 6000 });
    }
  };

  const handleSelectionChange = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  };

  const handleRemoveSelected = async () => {
    setIsDeleting(true);
    const toastId = toast.loading(`Removendo ${selectedItems.size} item(ns)...`);

    try {
      const selectedArray = Array.from(selectedItems) as string[];
      const bitdefenderIds = selectedArray
        .filter(id => id.startsWith('bitdefender-'))
        .map(id => parseInt(id.replace('bitdefender-', '')));

      const fortigateIds = selectedArray
        .filter(id => id.startsWith('fortigate-'))
        .map(id => parseInt(id.replace('fortigate-', '')));

      if (bitdefenderIds.length > 0) {
        await apiClient.bitdefender.bulkRemove(bitdefenderIds);
      }

      if (fortigateIds.length > 0) {
        await apiClient.fortigate.bulkRemove(fortigateIds);
      }

      toast.success(`${selectedItems.size} item(ns) removido(s) com sucesso!`, { id: toastId });
      setSelectedItems(new Set());
      setIsDeleteModalOpen(false);
      loadDataFromApi(); // Refresh matching the state

    } catch (error: any) {
      console.error("Error removing items:", error);
      toast.error(error.message || 'Erro ao remover itens.', { id: toastId, duration: 6000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const allItemsForEmail = useMemo(() => {
    const bitdefenderItems = processedBitdefender.map(item => ({ ...item, type: 'bitdefender' as const }));
    const fortigateItems = processedFortigate.map(item => ({ ...item, type: 'fortigate' as const }));
    // O365 e GMAIL não são incluídos aqui pois não têm data de vencimento calculada (status/remainingDays)
    return [...bitdefenderItems, ...fortigateItems];
  }, [processedBitdefender, processedFortigate]);

  const allItemsForExport = useMemo(() => {
    if (activeView === 'o365' || activeView === 'gmail') return []; // O365/GMAIL não usam o ExportButton padrão

    const currentFilteredData = activeView === 'bitdefender' ? filteredBitdefender : filteredFortigate;
    const type = activeView === 'bitdefender' ? 'bitdefender' : 'fortigate';
    return currentFilteredData.map(item => ({ ...item, type }));
  }, [activeView, filteredBitdefender, filteredFortigate]);

  const handleRowClick = (item: BitdefenderLicenseWithStatus | FortigateDeviceWithStatus) => {
    const type = 'company' in item ? 'bitdefender' : 'fortigate';
    setSelectedItemDetail({ ...item, type } as ItemDetail);
    setIsDetailSidebarOpen(true);
  };

  const handleO365ClientClick = (client: O365Client) => {
    setSelectedO365Client(client);
    setIsO365DetailModalOpen(true);
  };

  // Novo: Handler para abrir modal de detalhes GMAIL
  const handleGmailClientClick = (client: GmailClient) => {
    setSelectedGmailClient(client);
    setIsGmailDetailModalOpen(true);
  };


  const TabButton: React.FC<{ view: 'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware', label: string, icon: React.ElementType }> = ({ view, label, icon: Icon }) => {
    const hasPermission = isAdmin || user.permissions?.dashboards[view];
    if (!hasPermission) return null;

    return (
      <button
        onClick={() => {
          setActiveView(view);
          setSelectedItems(new Set()); // Limpa a seleção ao trocar de aba
          setCompanyFilter(''); // Limpa filtros ao trocar de aba
          setStatusFilter('all');
          setShowOnlyUrgent(false);
        }}
        className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
      >
        <Icon className="w-5 h-5 mr-2" />
        {label}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoaderCircle className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm-p-6 lg:p-8">
      {showAlertModal && <AlertModal onClose={() => setShowAlertModal(false)} />}

      {/* Modals de Adição */}
      {activeView === 'bitdefender' && (
        <AddBitdefenderModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddBitdefender} />
      )}
      {activeView === 'fortigate' && (
        <AddFortigateModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddFortigate} />
      )}
      {activeView === 'o365' && (
        <AddO365ClientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddO365Client} />
      )}
      {activeView === 'gmail' && ( // Novo Modal de Adição GMAIL
        <AddGmailClientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddGmailClient} />
      )}
      {activeView === 'hardware' && ( // Modal de Adição Hardware
        <AddHardwareModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddHardware} />
      )}

      <SendEmailModal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        onSend={handleSendCustomEmail}
        items={allItemsForEmail}
        initialSelectedItems={selectedItems}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveSelected}
        itemCount={selectedItems.size}
        isDeleting={isDeleting}
      />
      <DetailSidebar
        isOpen={isDetailSidebarOpen}
        onClose={() => setIsDetailSidebarOpen(false)}
        item={selectedItemDetail}
        onUpdate={handleUpdateFromSidebar}
        onSyncSuccess={async () => {
          await fetchAllData();
        }}
        isAdmin={canEdit}
      />

      {/* Modal de Detalhes O365 */}
      <O365DetailModal
        isOpen={isO365DetailModalOpen}
        onClose={() => setIsO365DetailModalOpen(false)}
        client={selectedO365Client}
        licenses={processedO365Licenses}
        onLicenseUpdate={handleUpdateO365License}
        onLicenseRemove={handleRemoveO365License}
        onAddLicense={handleAddO365License}
        onBulkImport={handleBulkImportO365Licenses}
        isAdmin={canEdit}
      />

      {/* Novo Modal de Detalhes GMAIL */}
      <GmailDetailModal
        isOpen={isGmailDetailModalOpen}
        onClose={() => setIsGmailDetailModalOpen(false)}
        client={selectedGmailClient}
        licenses={processedGmailLicenses}
        onLicenseUpdate={handleUpdateGmailLicense}
        onLicenseRemove={handleRemoveGmailLicense}
        onAddLicense={handleAddGmailLicense}
        onBulkImport={handleBulkImportGmailLicenses}
        isAdmin={canEdit}
      />

      {/* Modal de Detalhes Hardware */}
      <HardwareDetailModal
        isOpen={isHardwareDetailModalOpen}
        onClose={() => setIsHardwareDetailModalOpen(false)}
        device={selectedHardware}
        onUpdate={handleUpdateHardware}
        canEdit={canEdit}
      />

      {/* Novo Modal de Gerenciamento 2FA */}
      {isMfaModalOpen && <MfaEnrollment user={user} onClose={() => setIsMfaModalOpen(false)} />}

      {/* Novo Modal de Gerenciamento de Usuários */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        currentUser={user}
      />

      <div>
        <Header
          user={user}
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showOnlyUrgent={showOnlyUrgent}
          setShowOnlyUrgent={setShowOnlyUrgent}
          urgentCount={urgentCount}
          onSyncClick={handleSync}
          onAddClick={canEdit ? () => setIsAddModalOpen(true) : undefined}
          onRemoveClick={canDelete ? () => setIsDeleteModalOpen(true) : undefined}
          onSendAlertsClick={() => setIsSendEmailModalOpen(true)}
          onMfaClick={() => setIsMfaModalOpen(true)}
          onSettingsClick={isAdmin ? () => setIsUserManagementModalOpen(true) : undefined}
          selectedCount={selectedItems.size}
          theme={theme}
          toggleTheme={toggleTheme}
          isAdmin={isAdmin}
          selectedItems={allItemsForExport}
          allItems={allItemsForExport}
          activeView={activeView}
        />
        <main>
          <div className="mb-4 flex items-center space-x-4"> {/* Removido justify-between e items-stretch */}
            <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <TabButton view="bitdefender" label="Bitdefender" icon={Shield} />
              <TabButton view="fortigate" label="Fortigate" icon={Router} />
              <TabButton view="o365" label="Office 365" icon={Briefcase} />
              <TabButton view="gmail" label="GMAIL" icon={Mail} />
              <TabButton view="network" label="Mapa de Rede" icon={Network} />
              <TabButton view="hardware" label="Inventário" icon={HardDrive} />
            </div>
            {/* Scroller removido conforme pedido */}
          </div>

          {/* Filtros de Status e Urgência só aparecem para Bitdefender/Fortigate */}
          {(activeView === 'o365' || activeView === 'gmail') && (
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                O gerenciamento de licenças {activeView === 'o365' ? 'Office 365' : 'GMAIL'} é feito por cliente. Clique no cliente para visualizar e editar os usuários/licenças.
              </p>
            </div>
          )}

          {/* Barra de Ações: Busca e Remover */}
          {(activeView === 'bitdefender' || activeView === 'fortigate' || activeView === 'o365' || activeView === 'gmail') && (
            <div className="mb-4 flex items-center justify-between gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {/* Campo de Busca */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={`Buscar ${activeView === 'bitdefender' ? 'licenças' : activeView === 'fortigate' ? 'dispositivos' : 'clientes'}...`}
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botão Remover (aparece quando há itens selecionados) */}
              {selectedItems.size > 0 && canDelete && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remover ({selectedItems.size})
                </button>
              )}
            </div>
          )}

          {activeView === 'bitdefender' ? (
            <BitdefenderTable
              licenses={filteredBitdefender}
              onRowClick={handleRowClick}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
            />
          ) : activeView === 'fortigate' ? (
            <FortigateTable
              devices={filteredFortigate}
              onRowClick={handleRowClick}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
            />
          ) : activeView === 'o365' ? (
            <O365ClientTable
              clients={filteredO365Clients}
              licenses={processedO365Licenses}
              onLicenseUpdate={handleUpdateO365License}
              isAdmin={isAdmin}
              onClientClick={handleO365ClientClick}
            />
          ) : activeView === 'network' ? (
            <NetworkMapSubTab />
          ) : activeView === 'hardware' ? (
            <HardwareInventoryTable
              devices={filteredHardware}
              onRowClick={handleHardwareRowClick}
              onDelete={canDelete ? handleDeleteHardware : undefined}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ) : ( // activeView === 'gmail'
            <GmailClientTable
              clients={filteredGmailClients}
              licenses={processedGmailLicenses}
              onClientClick={handleGmailClientClick}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;