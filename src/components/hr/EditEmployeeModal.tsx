// src/components/hr/EditEmployeeModal.tsx
// TODO: Implementar modal de edição (similar ao AddEmployeeModal, mas carregando dados existentes)
import React from 'react';
import { Employee } from '../../types';

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onEmployeeUpdated: () => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose, onEmployeeUpdated }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Editar Funcionário</h2>
        <p className="mb-4">Em desenvolvimento...</p>
        <p className="text-sm text-gray-600">Funcionário: {employee.full_name}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
