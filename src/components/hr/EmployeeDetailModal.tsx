// src/components/hr/EmployeeDetailModal.tsx
import React, { useState } from 'react';
import { Employee } from '../../types';
import { X, Edit, User, Mail, Phone, MapPin, Briefcase, Calendar, FileText } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'address' | 'professional'>('personal');

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Férias': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Afastado': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Demitido': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {employee.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{employee.full_name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusBadge(employee.status)}`}>
                {employee.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit} 
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {[
            { id: 'personal', label: 'Dados Pessoais', icon: User },
            { id: 'contact', label: 'Contato', icon: Mail },
            { id: 'address', label: 'Endereço', icon: MapPin },
            { id: 'professional', label: 'Profissional', icon: Briefcase }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dados Pessoais */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Nome Completo" value={employee.full_name} icon={<User className="w-5 h-5" />} />
              <InfoField label="CPF" value={employee.cpf} icon={<FileText className="w-5 h-5" />} />
              <InfoField label="RG" value={employee.rg || '-'} icon={<FileText className="w-5 h-5" />} />
              <InfoField label="Órgão Emissor" value={employee.rg_issuer || '-'} />
              <InfoField label="Data de Emissão RG" value={formatDate(employee.rg_issue_date)} icon={<Calendar className="w-5 h-5" />} />
              <InfoField label="Data de Nascimento" value={formatDate(employee.birth_date)} icon={<Calendar className="w-5 h-5" />} />
              <InfoField label="Sexo" value={employee.gender || '-'} />
              <InfoField label="Estado Civil" value={employee.marital_status || '-'} />
              <InfoField label="Nacionalidade" value={employee.nationality || '-'} />
            </div>
          )}

          {/* Contato */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Email Pessoal" value={employee.personal_email || '-'} icon={<Mail className="w-5 h-5" />} />
              <InfoField label="Email Corporativo" value={employee.corporate_email || '-'} icon={<Mail className="w-5 h-5" />} />
              <InfoField label="Telefone Fixo" value={employee.phone || '-'} icon={<Phone className="w-5 h-5" />} />
              <InfoField label="Celular" value={employee.mobile_phone || '-'} icon={<Phone className="w-5 h-5" />} />
            </div>
          )}

          {/* Endereço */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="CEP" value={employee.zip_code || '-'} icon={<MapPin className="w-5 h-5" />} />
              <InfoField label="Rua/Avenida" value={employee.street || '-'} />
              <InfoField label="Número" value={employee.number || '-'} />
              <InfoField label="Complemento" value={employee.complement || '-'} />
              <InfoField label="Bairro" value={employee.neighborhood || '-'} />
              <InfoField label="Cidade" value={employee.city || '-'} />
              <InfoField label="Estado" value={employee.state || '-'} />
            </div>
          )}

          {/* Profissional */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Cargo" value={employee.position} icon={<Briefcase className="w-5 h-5" />} />
                <InfoField label="Departamento" value={employee.department || '-'} icon={<Briefcase className="w-5 h-5" />} />
                <InfoField label="Data de Admissão" value={formatDate(employee.hire_date)} icon={<Calendar className="w-5 h-5" />} />
                <InfoField label="Data de Demissão" value={formatDate(employee.termination_date)} icon={<Calendar className="w-5 h-5" />} />
                <InfoField label="Tipo de Contrato" value={employee.contract_type} />
                <InfoField label="Status" value={employee.status} />
                <InfoField label="Salário Base" value={formatCurrency(employee.salary)} />
                <InfoField label="Jornada de Trabalho" value={employee.work_hours || '-'} />
              </div>
              {employee.notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Observações</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {employee.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const InfoField: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <p className="text-gray-900 dark:text-white font-medium">{value}</p>
  </div>
);

export default EmployeeDetailModal;
