import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, LoaderCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { O365License } from '../types';

interface ImportLicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (licenses: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[]) => Promise<void>;
}

// Campos obrigatórios para uma licença O365
const REQUIRED_FIELDS = ['username', 'email', 'licenseType'];
const OPTIONAL_FIELDS = ['password'];

const ImportLicensesModal: React.FC<ImportLicensesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({}); // { 'Campo Requerido': 'Nome da Coluna no Arquivo' }
  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Importing
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setDataHeaders([]);
    setColumnMapping({});
    setStep(1);
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStep(2);
      readHeaders(selectedFile);
    }
  };

  const readHeaders = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Lê a primeira linha para obter os cabeçalhos
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
        const headers: string[] = json[0] as string[] || [];
        
        setDataHeaders(headers.map(h => h.trim()));
        
        // Tenta mapear automaticamente
        const initialMapping: Record<string, string> = {};
        REQUIRED_FIELDS.concat(OPTIONAL_FIELDS).forEach(requiredField => {
          const foundHeader = headers.find(header => 
            header.toLowerCase().includes(requiredField.toLowerCase()) || 
            header.toLowerCase().includes(requiredField.replace('licenseType', 'tipo').toLowerCase()) ||
            header.toLowerCase().includes(requiredField.replace('username', 'usuário').toLowerCase()) ||
            header.toLowerCase().includes(requiredField.replace('password', 'senha').toLowerCase())
          );
          if (foundHeader) {
            initialMapping[requiredField] = foundHeader;
          }
        });
        setColumnMapping(initialMapping);

      } catch (error) {
        toast.error('Erro ao ler o arquivo. Certifique-se de que é um arquivo Excel ou CSV válido.');
        resetState();
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleMappingChange = (requiredField: string, header: string) => {
    setColumnMapping(prev => ({ ...prev, [requiredField]: header }));
  };

  const handleImportData = useCallback(async () => {
    if (!file) return;

    // 1. Validação do Mapeamento
    const missingFields = REQUIRED_FIELDS.filter(field => !columnMapping[field]);
    if (missingFields.length > 0) {
      toast.error(`Os seguintes campos obrigatórios não foram mapeados: ${missingFields.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Processando dados...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converte para JSON, usando a primeira linha como cabeçalho
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const licensesToImport: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[] = [];
        let validCount = 0;

        rawJson.forEach(row => {
          const usernameHeader = columnMapping['username'];
          const emailHeader = columnMapping['email'];
          const licenseTypeHeader = columnMapping['licenseType'];
          const passwordHeader = columnMapping['password'];

          const email = row[emailHeader]?.toString().trim() || '';
          
          if (email && email.includes('@')) {
            validCount++;
            licensesToImport.push({
              username: row[usernameHeader]?.toString().trim() || '',
              email: email,
              licenseType: row[licenseTypeHeader]?.toString().trim() || 'Standard',
              password: passwordHeader ? (row[passwordHeader]?.toString().trim() || null) : null,
            });
          }
        });

        if (licensesToImport.length === 0) {
          toast.error('Nenhuma licença válida encontrada no arquivo.', { id: toastId });
          setIsProcessing(false);
          return;
        }

        toast.loading(`Importando ${licensesToImport.length} licenças...`, { id: toastId });
        await onImport(licensesToImport);
        
        toast.success(`Importação concluída! ${licensesToImport.length} licenças adicionadas.`, { id: toastId });
        resetState();
        onClose();
      };
      reader.readAsBinaryString(file);

    } catch (error) {
      console.error('Erro durante a importação:', error);
      toast.error('Falha na importação. Verifique o formato do arquivo.', { id: toastId });
      setIsProcessing(false);
    }
  }, [file, columnMapping, onImport, onClose]);

  const renderStep1 = () => (
    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={isProcessing}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center">
        <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Clique para selecionar um arquivo</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Arquivos suportados: .xlsx, .csv</p>
      </label>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <FileText className="w-5 h-5 text-blue-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arquivo selecionado: <span className="font-bold">{file?.name}</span></p>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">Mapeamento de Colunas</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Associe os campos obrigatórios do sistema às colunas do seu arquivo.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_FIELDS.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
              {field.replace('licenseType', 'Tipo de Licença').replace('username', 'Usuário').replace('email', 'Email')} <span className="text-red-500">*</span>
            </label>
            <select
              value={columnMapping[field] || ''}
              onChange={(e) => handleMappingChange(field, e.target.value)}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Selecione a Coluna --</option>
              {dataHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        ))}
        {OPTIONAL_FIELDS.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
              {field.replace('password', 'Senha')} (Opcional)
            </label>
            <select
              value={columnMapping[field] || ''}
              onChange={(e) => handleMappingChange(field, e.target.value)}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Ignorar Coluna --</option>
              {dataHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );

  const isMappingComplete = REQUIRED_FIELDS.every(field => columnMapping[field]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Importar Licenças Office 365</h2>
          <button onClick={onClose} disabled={isProcessing} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-between items-center">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          {step === 2 && (
            <button 
              type="button" 
              onClick={handleImportData}
              disabled={!isMappingComplete || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportLicensesModal;