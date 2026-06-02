// src/components/hr/EmployeeDetailModal.tsx
// TODO: Implementar modal de detalhes completo
import React from 'react';
import { Employee } from '../../types';
import { X, Edit } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Detalhes do Funcionário</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="mb-2"><strong>Nome:</strong> {employee.full_name}</p>
          <p className="mb-2"><strong>CPF:</strong> {employee.cpf}</p>
          <p className="mb-2"><strong>Cargo:</strong> {employee.position}</p>
          <p className="mb-2"><strong>Status:</strong> {employee.status}</p>
          <p className="text-sm text-gray-600 mt-4">Visualização completa em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
