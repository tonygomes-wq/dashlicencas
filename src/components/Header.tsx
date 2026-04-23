import React from 'react';
import { RefreshCw, LogOut, PlusCircle, Mail, Lock, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { apiClient } from '../lib/apiClient';
import { User, BitdefenderLicenseWithStatus, FortigateDeviceWithStatus } from '../types';
import toast from 'react-hot-toast';
import ExportButton from './ExportButton';

type Item = (BitdefenderLicenseWithStatus | FortigateDeviceWithStatus) & { type: 'bitdefender' | 'fortigate' };

interface HeaderProps {
  user: User;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  showOnlyUrgent: boolean;
  setShowOnlyUrgent: (value: boolean) => void;
  urgentCount: number;
  onSyncClick: () => void;
  onAddClick: () => void;
  onRemoveClick: () => void;
  onSendAlertsClick: () => void;
  onMfaClick: () => void;
  onSettingsClick: () => void;
  selectedCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAdmin: boolean;
  selectedItems: Set<string>;
  allItems: Item[];
  activeView: 'bitdefender' | 'fortigate' | 'o365' | 'gmail';
}

const Header: React.FC<HeaderProps> = ({
  user, companyFilter, setCompanyFilter, statusFilter, setStatusFilter, showOnlyUrgent, setShowOnlyUrgent, urgentCount, onSyncClick, onAddClick, onRemoveClick, onSendAlertsClick, onMfaClick, onSettingsClick, selectedCount, theme, toggleTheme, isAdmin, selectedItems, allItems, activeView
}) => {

  const handleLogout = async () => {
    const toastId = toast.loading('Saindo...');
    try {
      await apiClient.auth.logout();
      toast.success('Sessão encerrada com sucesso!', { id: toastId });
      window.location.reload(); // Recarrega para voltar ao Login
    } catch (error: any) {
      console.error('Erro durante o logout:', error);
      toast.error(`Falha ao sair: ${error.message}`, { id: toastId });
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-6 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Filtrar por cliente..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            title="Filtrar por status"
          >
            <option value="all">Todos os Status</option>
            <option value="VENCIDO">Vencido</option>
            <option value="PROXIMO">Próximo do Vencimento</option>
            <option value="OK">OK</option>
          </select>
          <button
            onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
            className={`px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 flex items-center w-full sm:w-auto justify-center ${showOnlyUrgent
              ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
              : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400'
              }`}
          >
            Mostrar Apenas Urgentes
            {urgentCount > 0 && (
              <span className={`ml-2 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold ${showOnlyUrgent ? 'bg-orange-800' : 'bg-gray-700'}`}>
                {urgentCount}
              </span>
            )}
          </button>
        </div>

        {/* Center Section: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            selectedItems={selectedItems}
            allItems={allItems}
            activeView={activeView as any}
          />

          {isAdmin && (
            <button
              onClick={onAddClick}
              className="px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar
            </button>
          )}

          <button
            onClick={onSendAlertsClick}
            className="px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar Alertas
          </button>

          <button
            onClick={onSyncClick}
            className="px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </button>
        </div>

        {/* Right Section: User Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMfaClick}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/50 hover:text-yellow-600 dark:hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors duration-200"
            aria-label="Gerenciar 2FA"
            title="Gerenciar 2FA"
          >
            <Lock className="w-5 h-5" />
          </button>
          {isAdmin && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Configurações de Usuário"
              title="Configurações de Usuário"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={user.email}>
              {user.email}
            </p>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-red-500 transition-colors duration-200"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;