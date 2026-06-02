// src/components/hr/HRDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Heart, 
  Gift, 
  TrendingUp, 
  AlertCircle,
  UserPlus,
  FileText,
  Cake
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Employee, HRStats } from '../../types';
import EmployeeTable from './EmployeeTable';
import VacationTable from './VacationTable';
import LeaveTable from './LeaveTable';
import BenefitTable from './BenefitTable';
import AddEmployeeModal from './AddEmployeeModal';
import toast from 'react-hot-toast';

interface HRDashboardProps {
  onClose?: () => void;
}

type HRTab = 'employees' | 'vacations' | 'leaves' | 'benefits';

const HRDashboard: React.FC<HRDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<HRTab>('employees');
  const [stats, setStats] = useState<HRStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Carregar estatísticas
  useEffect(() => {
    loadStats();
  }, []);

  // Carregar funcionários quando aba estiver ativa
  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await apiClient.hr.stats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas do RH');
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.hr.employees.list();
      setEmployees(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeAdded = () => {
    loadEmployees();
    loadStats();
    setShowAddModal(false);
  };

  const handleEmployeeUpdated = () => {
    loadEmployees();
    loadStats();
  };

  const handleEmployeeDeleted = () => {
    loadEmployees();
    loadStats();
  };

  // Calcular estatísticas resumidas
  const activeEmployees = stats?.by_status.find(s => s.status === 'Ativo')?.count || 0;
  const onVacation = stats?.by_status.find(s => s.status === 'Férias')?.count || 0;
  const onLeave = stats?.by_status.find(s => s.status === 'Afastado')?.count || 0;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Recursos Humanos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestão de funcionários, férias, afastamentos e benefícios
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Estatísticas Cards */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Funcionários */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Funcionários
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {stats?.total_employees || 0}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {activeEmployees} ativos
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Férias */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Em Férias
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {onVacation}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stats?.upcoming_vacations.length || 0} programadas
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Afastamentos */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Afastados
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {onLeave}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {stats?.active_leaves.length || 0} ativos
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Aniversariantes */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Aniversariantes
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {stats?.birthdays_this_month.length || 0}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Cake className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'employees'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Funcionários
            </span>
            {activeTab === 'employees' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('vacations')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'vacations'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Férias
            </span>
            {activeTab === 'vacations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'leaves'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Afastamentos
            </span>
            {activeTab === 'leaves' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'benefits'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Benefícios
            </span>
            {activeTab === 'benefits' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'employees' && (
          <EmployeeTable
            employees={employees}
            isLoading={isLoading}
            onEmployeeUpdated={handleEmployeeUpdated}
            onEmployeeDeleted={handleEmployeeDeleted}
          />
        )}
        {activeTab === 'vacations' && (
          <VacationTable onVacationUpdated={loadStats} />
        )}
        {activeTab === 'leaves' && (
          <LeaveTable onLeaveUpdated={loadStats} />
        )}
        {activeTab === 'benefits' && (
          <BenefitTable onBenefitUpdated={loadStats} />
        )}
      </div>

      {/* Modais */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onEmployeeAdded={handleEmployeeAdded}
        />
      )}
    </div>
  );
};

export default HRDashboard;
