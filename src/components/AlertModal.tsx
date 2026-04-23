
import React from 'react';
import { WarningIcon } from './icons';

interface AlertModalProps {
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full transform transition-all scale-100 opacity-100">
        <div className="bg-red-600 dark:bg-red-700 text-white p-4 rounded-t-lg flex items-center">
          <WarningIcon className="h-8 w-8 mr-3" />
          <h2 className="text-xl font-bold">Alerta de Vencimento</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-200 text-lg">
            ⚠ Atenção: Existem licenças Bitdefender vencidas ou próximas do vencimento.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
