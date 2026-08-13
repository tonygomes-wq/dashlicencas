// src/components/hr/BenefitTable.tsx
import React, { useState, useEffect } from 'react';
import { Benefit, Employee } from '../../types';
import { apiClient } from '../../lib/apiClient';
import { Gift, Search, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface BenefitTableProps {
  onBenefitUpdated: () => void;
}

const BenefitTable: React.FC<BenefitTableProps> = ({ onBenefitUpdated }) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
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
      const [benefitsData, employeesData] = await Promise.all([
        apiClient.hr.benefits.list(),
        apiClient.hr.employees.list()
      ]);
      setBenefits(benefitsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error);
      toast.error('Erro ao carregar benefícios');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.full_name || 'Desconhecido';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este benefício?')) return;
    
    try {
      await apiClient.hr.benefits.delete(id);
      toast.success('Benefício excluído com sucesso!');
      loadData();
      onBenefitUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      'Vale Refeição': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Vale Transporte': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Plano de Saúde': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Plano Odontológico': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Seguro de Vida': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Vale Combustível': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredBenefits = benefits.filter(benefit => {
    const employeeName = getEmployeeName(benefit.employee_id).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || benefit.benefit_type === typeFilter;
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
            <Gift className="w-5 h-5 text-purple-600" />
            Benefícios ({filteredBenefits.length})
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
            <option value="Vale Refeição">Vale Refeição</option>
            <option value="Vale Transporte">Vale Transporte</option>
            <option value="Plano de Saúde">Plano de Saúde</option>
            <option value="Plano Odontológico">Plano Odontológico</option>
            <option value="Seguro de Vida">Seguro de Vida</option>
            <option value="Vale Combustível">Vale Combustível</option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Mensal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBenefits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum benefício cadastrado
                </td>
              </tr>
            ) : (
              filteredBenefits.map((benefit) => (
                <tr key={benefit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getEmployeeName(benefit.employee_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(benefit.benefit_type)}`}>
                      {benefit.benefit_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(benefit.monthly_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(benefit.start_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(benefit.end_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(benefit.id)}
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

export default BenefitTable;
