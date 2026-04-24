import React, { useState, useEffect } from 'react';
import { Shield, Flame, Mail, AtSign, HardDrive, Network } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import BitdefenderAPIStats from '../components/dashboard/BitdefenderAPIStats';
import AlertsList from '../components/dashboard/AlertsList';
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch Bitdefender stats
      const bitdefenderData = await apiClient.bitdefender.getAll();
      const bitdefenderStats = {
        total: bitdefenderData.length,
        expired: bitdefenderData.filter((l: any) => {
          if (!l.expirationDate) return false;
          return new Date(l.expirationDate) < new Date();
        }).length,
        expiring: bitdefenderData.filter((l: any) => {
          if (!l.expirationDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(l.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        }).length,
        ok: 0
      };
      bitdefenderStats.ok = bitdefenderStats.total - bitdefenderStats.expired - bitdefenderStats.expiring;

      // Fetch Fortigate stats
      const fortigateData = await apiClient.fortigate.getAll();
      const fortigateStats = {
        total: fortigateData.length,
        expired: fortigateData.filter((d: any) => {
          if (!d.vencimento) return false;
          return new Date(d.vencimento) < new Date();
        }).length,
        expiring: fortigateData.filter((d: any) => {
          if (!d.vencimento) return false;
          const daysUntilExpiry = Math.ceil((new Date(d.vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        }).length,
        ok: 0
      };
      fortigateStats.ok = fortigateStats.total - fortigateStats.expired - fortigateStats.expiring;

      // TODO: Fetch other stats (O365, Gmail, Inventory, Network)
      
      setStats({
        bitdefender: bitdefenderStats,
        fortigate: fortigateStats,
        office365: { total: 120, active: 115, inactive: 5 },
        gmail: { total: 85, active: 80, inactive: 5 },
        inventory: { total: 85, desktop: 45, notebook: 32, server: 8 },
        network: { total: 70, online: 67, offline: 3 }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard - Visão Geral
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe todas as suas licenças e dispositivos em um só lugar
        </p>
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

      {/* Alerts List */}
      <AlertsList />
    </div>
  );
};

export default DashboardHome;
