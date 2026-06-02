// src/components/hr/BenefitTable.tsx
// TODO: Implementar tabela de benefícios
import React from 'react';

interface BenefitTableProps {
  onBenefitUpdated: () => void;
}

const BenefitTable: React.FC<BenefitTableProps> = ({ onBenefitUpdated }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Benefícios</h3>
      <p className="text-gray-600 dark:text-gray-400">Tabela de benefícios em desenvolvimento...</p>
    </div>
  );
};

export default BenefitTable;
