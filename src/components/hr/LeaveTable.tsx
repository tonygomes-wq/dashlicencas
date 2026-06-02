// src/components/hr/LeaveTable.tsx
// TODO: Implementar tabela de afastamentos
import React from 'react';

interface LeaveTableProps {
  onLeaveUpdated: () => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ onLeaveUpdated }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Afastamentos</h3>
      <p className="text-gray-600 dark:text-gray-400">Tabela de afastamentos em desenvolvimento...</p>
    </div>
  );
};

export default LeaveTable;
