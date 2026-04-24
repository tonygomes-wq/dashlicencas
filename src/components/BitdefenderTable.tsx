import React from 'react';
import { BitdefenderLicense, BitdefenderLicenseWithStatus, LicenseStatus } from '../types';

interface BitdefenderTableProps {
  licenses: BitdefenderLicenseWithStatus[];
  onRowClick: (license: BitdefenderLicenseWithStatus) => void;
  selectedItems: Set<string>;
  onSelectionChange: (itemId: string) => void;
}

const StatusBadge: React.FC<{ status: LicenseStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-bold rounded-full text-white inline-block';
  const statusConfig = {
    [LicenseStatus.Vencido]: 'bg-red-600',
    [LicenseStatus.VenceHoje]: 'bg-yellow-500',
    [LicenseStatus.VenceEm7Dias]: 'bg-orange-500',
    [LicenseStatus.OK]: 'bg-green-600',
  };
  return <span className={`${baseClasses} ${statusConfig[status]}`}>{status}</span>;
};

const BitdefenderTable: React.FC<BitdefenderTableProps> = ({ licenses, onRowClick, selectedItems, onSelectionChange }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString || !dateString.includes('-')) return 'Data inválida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    licenses.forEach(license => {
      const itemId = `bitdefender-${license.id}`;
      const isSelected = selectedItems.has(itemId);
      if (e.target.checked && !isSelected) {
        onSelectionChange(itemId);
      } else if (!e.target.checked && isSelected) {
        onSelectionChange(itemId);
      }
    });
  };

  const allVisibleSelected = licenses.length > 0 && licenses.every(l => selectedItems.has(`bitdefender-${l.id}`));

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600">
                <input type="checkbox" onChange={handleSelectAll} checked={allVisibleSelected} />
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                SERIAL CHAVE
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                TOTAL DE LICENÇAS
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Renovação
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Dias Restantes
              </th>
            </tr>
          </thead>
          <tbody>
            {licenses.length > 0 ? (
              licenses.map((license) => {
                const itemId = `bitdefender-${license.id}`;
                const isSelected = selectedItems.has(itemId);
                return (
                  <tr 
                    key={license.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    onClick={(e) => {
                        // Evita abrir o modal ao clicar no checkbox
                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            onRowClick(license);
                        }
                    }}
                  >
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => onSelectionChange(itemId)} />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {license.company}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {license.contactPerson}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {license.email}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {license.licenseKey}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center text-gray-900 dark:text-white">
                      {license.totalLicenses}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                      {formatDate(license.expirationDate)}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      <StatusBadge status={license.status} />
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{license.renewalStatus}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-center">
                      <p className={`font-semibold whitespace-no-wrap ${license.remainingDays <= 7 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                        {license.remainingDays}
                      </p>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Nenhum dado encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BitdefenderTable;