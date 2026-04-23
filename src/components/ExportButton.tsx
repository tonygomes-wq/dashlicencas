import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BitdefenderLicenseWithStatus, FortigateDeviceWithStatus } from '../types';
import toast from 'react-hot-toast';

type Item = (BitdefenderLicenseWithStatus | FortigateDeviceWithStatus) & { type: 'bitdefender' | 'fortigate' };

interface ExportButtonProps {
  selectedItems: Set<string>;
  allItems: Item[];
  activeView: 'bitdefender' | 'fortigate';
}

const ExportButton: React.FC<ExportButtonProps> = ({ selectedItems, allItems, activeView }) => {
  const selectedData = useMemo(() => {
    const selectedArray = Array.from(selectedItems);
    return allItems.filter(item => {
      const itemId = `${item.type}-${item.id}`;
      return selectedArray.includes(itemId);
    });
  }, [selectedItems, allItems]);

  const isButtonDisabled = selectedData.length === 0;

  const handleExport = () => {
    if (isButtonDisabled) {
      toast.error('Selecione pelo menos um item para exportar.');
      return;
    }

    const toastId = toast.loading('Preparando exportação...');

    try {
      let dataToExport: any[] = [];
      let sheetName = '';
      let fileName = '';

      if (activeView === 'bitdefender') {
        dataToExport = selectedData.map(item => ({
          Empresa: (item as BitdefenderLicenseWithStatus).company,
          Responsável: (item as BitdefenderLicenseWithStatus).contactPerson,
          Email: (item as BitdefenderLicenseWithStatus).email,
          'Serial Chave': (item as BitdefenderLicenseWithStatus).licenseKey,
          'Total de Licenças': (item as BitdefenderLicenseWithStatus).totalLicenses,
          Vencimento: (item as BitdefenderLicenseWithStatus).expirationDate,
          Status: item.status,
          'Dias Restantes': item.remainingDays,
        }));
        sheetName = 'Bitdefender Licenses';
        fileName = 'Bitdefender_Export.xlsx';
      } else if (activeView === 'fortigate') {
        dataToExport = selectedData.map(item => ({
          Cliente: (item as FortigateDeviceWithStatus).client,
          Email: (item as FortigateDeviceWithStatus).email,
          Serial: (item as FortigateDeviceWithStatus).serial,
          Modelo: (item as FortigateDeviceWithStatus).model,
          'Data de Registro': (item as FortigateDeviceWithStatus).registrationDate,
          Vencimento: (item as FortigateDeviceWithStatus).vencimento,
          Status: item.status,
          'Dias Restantes': item.remainingDays,
        }));
        sheetName = 'Fortigate Devices';
        fileName = 'Fortigate_Export.xlsx';
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      XLSX.writeFile(wb, fileName);
      
      toast.success('Dados exportados com sucesso!', { id: toastId });

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Falha ao exportar dados.', { id: toastId });
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isButtonDisabled}
      className="px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 flex items-center w-full sm:w-auto justify-center bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 disabled:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 dark:disabled:bg-gray-700/50"
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar ({selectedData.length})
    </button>
  );
};

export default ExportButton;