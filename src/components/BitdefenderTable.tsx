import React, { useState } from 'react';
import { BitdefenderLicense, BitdefenderLicenseWithStatus, LicenseStatus } from '../types';
import LicenseUsageIndicator from './LicenseUsageIndicator';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface BitdefenderTableProps {
  licenses: BitdefenderLicenseWithStatus[];
  onRowClick: (license: BitdefenderLicenseWithStatus) => void;
  selectedItems: Set<string>;
  onSelectionChange: (itemId: string) => void;
}

type SortField = 'company' | 'expirationDate' | 'remainingDays';
type SortDirection = 'asc' | 'desc' | null;

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
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString || !dateString.includes('-')) return 'Data inválida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtrar por status
  const filteredLicenses = statusFilter === 'all' 
    ? licenses 
    : licenses.filter(license => license.status === statusFilter);

  // Ordenar
  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'company':
        aValue = a.company?.toLowerCase() || '';
        bValue = b.company?.toLowerCase() || '';
        break;
      case 'expirationDate':
        aValue = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
        bValue = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
        break;
      case 'remainingDays':
        aValue = a.remainingDays;
        bValue = b.remainingDays;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    sortedLicenses.forEach(license => {
      const itemId = `bitdefender-${license.id}`;
      const isSelected = selectedItems.has(itemId);
      if (e.target.checked && !isSelected) {
        onSelectionChange(itemId);
      } else if (!e.target.checked && isSelected) {
        onSelectionChange(itemId);
      }
    });
  };

  const allVisibleSelected = sortedLicenses.length > 0 && sortedLicenses.every(l => selectedItems.has(`bitdefender-${l.id}`));

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Filtro de Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filtrar por Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LicenseStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value={LicenseStatus.OK}>OK</option>
            <option value={LicenseStatus.VenceEm7Dias}>Vence em 7 dias</option>
            <option value={LicenseStatus.VenceHoje}>Vence Hoje</option>
            <option value={LicenseStatus.Vencido}>Vencido</option>
          </select>
          {statusFilter !== 'all' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({filteredLicenses.length} {filteredLicenses.length === 1 ? 'resultado' : 'resultados'})
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600">
                <input type="checkbox" onChange={handleSelectAll} checked={allVisibleSelected} />
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Empresa
                  <SortIcon field="company" />
                </button>
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
                Uso de Licença
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('expirationDate')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Vencimento
                  <SortIcon field="expirationDate" />
                </button>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Renovação
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('remainingDays')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                >
                  Dias Restantes
                  <SortIcon field="remainingDays" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLicenses.length > 0 ? (
              sortedLicenses.map((license) => {
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
                    <td className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                      {(license as any).usedSlots !== undefined && (license as any).totalSlots !== undefined ? (
                        <LicenseUsageIndicator
                          usedSlots={(license as any).usedSlots || 0}
                          totalSlots={(license as any).totalSlots || license.totalLicenses}
                          usagePercent={(license as any).licenseUsagePercent}
                          size="sm"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Sincronizar para ver uso
                        </span>
                      )}
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
                <td colSpan={11} className="text-center py-10 text-gray-500 dark:text-gray-400">
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