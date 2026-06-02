// src/components/hr/EmployeeTable.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Employee, EmployeeStatus, ContractType } from '../../types';
import { apiClient } from '../../lib/apiClient';
import EditEmployeeModal from './EditEmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import toast from 'react-hot-toast';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEmployeeUpdated: () => void;
  onEmployeeDeleted: () => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading,
  onEmployeeUpdated,
  onEmployeeDeleted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [contractFilter, setContractFilter] = useState<ContractType | 'all'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filtrar funcionários
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cpf.includes(searchTerm) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesContract = contractFilter === 'all' || emp.contract_type === contractFilter;

    return matchesSearch && matchesStatus && matchesContract;
  });

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.hr.employees.remove(id);
      toast.success('Funcionário removido com sucesso!');
      onEmployeeDeleted();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      toast.error('Erro ao remover funcionário');
    }
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    const styles = {
      'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Férias': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Afastado': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Demitido': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF, cargo ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | 'all')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Férias">Férias</option>
              <option value="Afastado">Afastado</option>
              <option value="Demitido">Demitido</option>
            </select>
          </div>

          {/* Filtro Contrato */}
          <div>
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value as ContractType | 'all')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Contratos</option>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="Estagiário">Estagiário</option>
              <option value="Temporário">Temporário</option>
              <option value="Aprendiz">Aprendiz</option>
            </select>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredEmployees.length} de {employees.length} funcionários
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhum funcionário encontrado
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => handleView(employee)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {employee.full_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.full_name}
                          </div>
                          {employee.corporate_email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {employee.corporate_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        {employee.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.contract_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(employee.hire_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleView(employee)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === employee.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                              title="Confirmar exclusão"
                            >
                              Confirmar?
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Cancelar"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(employee.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onEmployeeUpdated={() => {
            onEmployeeUpdated();
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeTable;
