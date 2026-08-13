// src/components/hr/LeaveTable.tsx
import React, { useState, useEffect } from 'react';
import { Leave, Employee } from '../../types';
import { apiClient } from '../../lib/apiClient';
import { Heart, Search, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveTableProps {
  onLeaveUpdated: () => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ onLeaveUpdated }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leavesData, employeesData] = await Promise.all([
        apiClient.hr.leaves.list(),
        apiClient.hr.employees.list()
      ]);
      setLeaves(leavesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar afastamentos:', error);
      toast.error('Erro ao carregar afastamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.full_name || 'Desconhecido';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este afastamento?')) return;
    
    try {
      await apiClient.hr.leaves.delete(id);
      toast.success('Afastamento excluído com sucesso!');
      loadData();
      onLeaveUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      'Licença Médica': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Licença Maternidade': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'Licença Paternidade': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'INSS': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Acidente de Trabalho': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredLeaves = leaves.filter(leave => {
    const employeeName = getEmployeeName(leave.employee_id).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || leave.leave_type === typeFilter;
    return matchesSearch && matchesType;
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
            <Heart className="w-5 h-5 text-orange-600" />
            Afastamentos ({filteredLeaves.length})
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Licença Médica">Licença Médica</option>
            <option value="Licença Maternidade">Licença Maternidade</option>
            <option value="Licença Paternidade">Licença Paternidade</option>
            <option value="INSS">INSS</option>
            <option value="Acidente de Trabalho">Acidente de Trabalho</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Retorno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum afastamento registrado
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getEmployeeName(leave.employee_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(leave.leave_type)}`}>
                      {leave.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(leave.start_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(leave.expected_return_date)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs" title={leave.reason}>
                      {leave.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default LeaveTable;
