import React, { useState, useEffect } from 'react';
import { Shield, Flame, Mail, AtSign, HardDrive, Network, Filter } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import BitdefenderAPIStats from '../components/dashboard/BitdefenderAPIStats';
import FortigateAPIStats from '../components/dashboard/FortigateAPIStats';
import AlertsList from '../components/dashboard/AlertsList';
import LicenseUsageAlerts from '../components/dashboard/LicenseUsageAlerts';
import { apiClient } from '../lib/apiClient';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    bitdefender: { total: 0, expired: 0, expiring: 0, ok: 0 },
    fortigate: { total: 0, expired: 0, expiring: 0, ok: 0 },
    office365: { total: 0, active: 0, inactive: 0 },
    gmail: { total: 0, active: 0, inactive: 0 },
    inventory: { total: 0, desktop: 0, notebook: 0, server: 0 },
    network: { total: 0, online: 0, offline: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [clients, setClients] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, [clientFilter]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch all data including O365 and Gmail clients for name-based filtering
      const [bitdefenderData, fortigateData, o365ClientsData, o365LicensesData, gmailClientsData, gmailLicensesData, hardwareData] = await Promise.all([
        apiClient.bitdefender.list(),
        apiClient.fortigate.list(),
        apiClient.o365.clients.list(),
        apiClient.o365.licenses.list(),
        apiClient.gmail.clients.list(),
        apiClient.gmail.licenses.list(),
        apiClient.hardware.list()
      ]);

      // Build lookup maps: client_id -> client_name (normalized to uppercase for matching)
      const o365ClientMap = new Map<string, string>();
      o365ClientsData.forEach((c: any) => {
        if (c.id && c.client_name) o365ClientMap.set(c.id, c.client_name);
      });

      const gmailClientMap = new Map<string, string>();
      gmailClientsData.forEach((c: any) => {
        if (c.id && c.client_name) gmailClientMap.set(c.id, c.client_name);
      });

      // Extract unique clients for filter dropdown (from all sources)
      const uniqueClients = new Set<string>();
      bitdefenderData.forEach((l: any) => l.company && uniqueClients.add(l.company));
      fortigateData.forEach((d: any) => d.client && uniqueClients.add(d.client.trim()));
      o365ClientsData.forEach((c: any) => c.client_name && uniqueClients.add(c.client_name));
      gmailClientsData.forEach((c: any) => c.client_name && uniqueClients.add(c.client_name));
      setClients(Array.from(uniqueClients).sort());

      // Helper: normalize name for comparison (trim + uppercase)
      const normalize = (s: string) => (s || '').trim().toUpperCase();

      // Filter data by client if selected
      const filteredBitdefender = clientFilter === 'all'
        ? bitdefenderData
        : bitdefenderData.filter((l: any) => normalize(l.company) === normalize(clientFilter));

      const filteredFortigate = clientFilter === 'all'
        ? fortigateData
        : fortigateData.filter((d: any) => normalize(d.client) === normalize(clientFilter));

      // For O365: find matching client IDs, then filter licenses by those IDs
      const filteredO365Licenses = clientFilter === 'all'
        ? o365LicensesData
        : o365LicensesData.filter((l: any) => {
            const clientName = o365ClientMap.get(l.client_id) || '';
            return normalize(clientName) === normalize(clientFilter);
          });

      // For Gmail: find matching client IDs, then filter licenses by those IDs
      const filteredGmailLicenses = clientFilter === 'all'
        ? gmailLicensesData
        : gmailLicensesData.filter((l: any) => {
            const clientName = gmailClientMap.get(l.client_id) || '';
            return normalize(clientName) === normalize(clientFilter);
          });

      // For Hardware: filter by client field if it exists
      const filteredHardware = clientFilter === 'all'
        ? hardwareData
        : hardwareData.filter((d: any) => normalize(d.client || d.company || d.client_name || '') === normalize(clientFilter));

      // Calculate Bitdefender stats
      const bitdefenderStats = {
        total: filteredBitdefender.length,
        expired: filteredBitdefender.filter((l: any) => {
          if (!l.expiration_date) return false;
          return new Date(l.expiration_date) < new Date();
        }).length,
        expiring: filteredBitdefender.filter((l: any) => {
          if (!l.expiration_date) return false;
          const daysUntilExpiry = Math.ceil((new Date(l.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        }).length,
        ok: 0
      };
      bitdefenderStats.ok = bitdefenderStats.total - bitdefenderStats.expired - bitdefenderStats.expiring;

      // Calculate Fortigate stats
      const fortigateStats = {
        total: filteredFortigate.length,
        expired: filteredFortigate.filter((d: any) => {
          if (!d.vencimento) return false;
          return new Date(d.vencimento) < new Date();
        }).length,
        expiring: filteredFortigate.filter((d: any) => {
          if (!d.vencimento) return false;
          const daysUntilExpiry = Math.ceil((new Date(d.vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        }).length,
        ok: 0
      };
      fortigateStats.ok = fortigateStats.total - fortigateStats.expired - fortigateStats.expiring;

      // Calculate O365 stats (using filtered licenses)
      const o365Stats = {
        total: filteredO365Licenses.length,
        active: filteredO365Licenses.filter((l: any) => l.renewal_status === 'Renovado').length,
        inactive: filteredO365Licenses.filter((l: any) => l.renewal_status === 'Pendente').length
      };

      // Calculate Gmail stats (using filtered licenses)
      const gmailStats = {
        total: filteredGmailLicenses.length,
        active: filteredGmailLicenses.filter((l: any) => l.renewal_status === 'Renovado').length,
        inactive: filteredGmailLicenses.filter((l: any) => l.renewal_status === 'Pendente').length
      };

      // Calculate Hardware stats (using filtered hardware)
      const hardwareStats = {
        total: filteredHardware.length,
        desktop: filteredHardware.filter((d: any) => d.device_type === 'Desktop').length,
        notebook: filteredHardware.filter((d: any) => d.device_type === 'Notebook').length,
        server: filteredHardware.filter((d: any) => d.device_type === 'Servidor').length
      };

      setStats({
        bitdefender: bitdefenderStats,
        fortigate: fortigateStats,
        office365: o365Stats,
        gmail: gmailStats,
        inventory: hardwareStats,
        network: { total: 0, online: 0, offline: 0 } // Network não tem dados ainda
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard - Visão Geral
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe todas as suas licenças e dispositivos em um só lugar
          </p>
        </div>

        {/* Client Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Clientes</option>
            {clients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bitdefender Card */}
        <StatsCard
          title="Bitdefender"
          icon={Shield}
          iconColor="text-red-600 dark:text-red-400"
          stats={[
            { label: 'Total de Licenças', value: stats.bitdefender.total },
            { label: 'Vencidas', value: stats.bitdefender.expired, color: 'text-red-600 dark:text-red-400' },
            { label: 'Vence em 7 dias', value: stats.bitdefender.expiring, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'OK', value: stats.bitdefender.ok, color: 'text-green-600 dark:text-green-400' }
          ]}
          onViewDetails={() => onNavigate('bitdefender')}
        />

        {/* Fortigate Card */}
        <StatsCard
          title="Fortigate"
          icon={Flame}
          iconColor="text-orange-600 dark:text-orange-400"
          stats={[
            { label: 'Total de Dispositivos', value: stats.fortigate.total },
            { label: 'Vencidos', value: stats.fortigate.expired, color: 'text-red-600 dark:text-red-400' },
            { label: 'Vence em 7 dias', value: stats.fortigate.expiring, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'OK', value: stats.fortigate.ok, color: 'text-green-600 dark:text-green-400' }
          ]}
          onViewDetails={() => onNavigate('fortigate')}
        />

        {/* Office 365 Card */}
        <StatsCard
          title="Office 365"
          icon={Mail}
          iconColor="text-blue-500 dark:text-blue-300"
          stats={[
            { label: 'Total de Licenças', value: stats.office365.total },
            { label: 'Ativas', value: stats.office365.active, color: 'text-green-600 dark:text-green-400' },
            { label: 'Inativas', value: stats.office365.inactive, color: 'text-gray-600 dark:text-gray-400' }
          ]}
          onViewDetails={() => onNavigate('office365')}
        />

        {/* Gmail Card */}
        <StatsCard
          title="Gmail"
          icon={AtSign}
          iconColor="text-red-500 dark:text-red-300"
          stats={[
            { label: 'Total de Licenças', value: stats.gmail.total },
            { label: 'Ativas', value: stats.gmail.active, color: 'text-green-600 dark:text-green-400' },
            { label: 'Inativas', value: stats.gmail.inactive, color: 'text-gray-600 dark:text-gray-400' }
          ]}
          onViewDetails={() => onNavigate('gmail')}
        />

        {/* Inventory Card */}
        <StatsCard
          title="Inventário"
          icon={HardDrive}
          iconColor="text-purple-600 dark:text-purple-400"
          stats={[
            { label: 'Total de Dispositivos', value: stats.inventory.total },
            { label: 'Desktop', value: stats.inventory.desktop },
            { label: 'Notebook', value: stats.inventory.notebook },
            { label: 'Servidor', value: stats.inventory.server }
          ]}
          onViewDetails={() => onNavigate('inventory')}
        />

        {/* Network Card */}
        <StatsCard
          title="Rede"
          icon={Network}
          iconColor="text-green-600 dark:text-green-400"
          stats={[
            { label: 'Total de Dispositivos', value: stats.network.total },
            { label: 'Online', value: stats.network.online, color: 'text-green-600 dark:text-green-400' },
            { label: 'Offline', value: stats.network.offline, color: 'text-red-600 dark:text-red-400' },
            { label: 'Manutenção', value: 0, color: 'text-amber-600 dark:text-amber-400' }
          ]}
          onViewDetails={() => onNavigate('network')}
        />
      </div>

      {/* Bitdefender API Stats */}
      <BitdefenderAPIStats />

      {/* License Usage Alerts - Temporariamente desabilitado até deploy */}
      {/* <LicenseUsageAlerts /> */}

      {/* FortiGate API Stats */}
      <FortigateAPIStats onSyncAll={fetchDashboardStats} />

      {/* Alerts List */}
      <AlertsList />
    </div>
  );
};

export default DashboardHome;
