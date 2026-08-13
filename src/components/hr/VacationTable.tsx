// src/components/hr/VacationTable.tsx
import React, { useState, useEffect } from 'react';
import { Vacation, Employee } from '../../types';
import { apiClient } from '../../lib/apiClient';
import { Calendar, Search, Filter, Trash2, CheckCircle, XCircle, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface VacationTableProps {
  onVacationUpdated: () => void;
}

const VacationTable: React.FC<VacationTableProps> = ({ onVacationUpdated }) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vacationsData, employeesData] = await Promise.all([
        apiClient.hr.vacations.list(),
        apiClient.hr.employees.list()
      ]);
      setVacations(vacationsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar férias:', error);
      toast.error('Erro ao carregar dados de férias');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.full_name || 'Desconhecido';
  };

  const handleApprove = async (id: number) => {
    try {
      await apiClient.hr.vacations.update(id, { status: 'Aprovada' });
      toast.success('Férias aprovadas com sucesso!');
      loadData();
      onVacationUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar férias');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    
    try {
      await apiClient.hr.vacations.update(id, { status: 'Rejeitada', rejection_reason: reason });
      toast.success('Férias rejeitadas');
      loadData();
      onVacationUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar férias');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este registro de férias?')) return;
    
    try {
      await apiClient.hr.vacations.delete(id);
      toast.success('Registro excluído com sucesso!');
      loadData();
      onVacationUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Solicitada': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Aprovada': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Rejeitada': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Concluída': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredVacations = vacations.filter(vacation => {
    const employeeName = getEmployeeName(vacation.employee_id).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vacation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Férias ({filteredVacations.length})
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Solicitada">Solicitada</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Rejeitada">Rejeitada</option>
            <option value="Concluída">Concluída</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Período</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredVacations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum registro de férias encontrado
                </td>
              </tr>
            ) : (
              filteredVacations.map((vacation) => (
                <tr key={vacation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getEmployeeName(vacation.employee_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{vacation.days_requested}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vacation.status)}`}>
                      {vacation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {vacation.status === 'Solicitada' && (
                        <>
                          <button
                            onClick={() => handleApprove(vacation.id)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(vacation.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Rejeitar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(vacation.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VacationTable;
