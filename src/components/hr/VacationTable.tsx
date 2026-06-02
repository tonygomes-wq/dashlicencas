// src/components/hr/VacationTable.tsx
// TODO: Implementar tabela de férias
import React from 'react';

interface VacationTableProps {
  onVacationUpdated: () => void;
}

const VacationTable: React.FC<VacationTableProps> = ({ onVacationUpdated }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Férias</h3>
      <p className="text-gray-600 dark:text-gray-400">Tabela de férias em desenvolvimento...</p>
    </div>
  );
};

export default VacationTable;
