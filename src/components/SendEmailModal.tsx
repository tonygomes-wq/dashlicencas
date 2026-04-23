import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { BitdefenderLicenseWithStatus, FortigateDeviceWithStatus } from '../types';
import toast from 'react-hot-toast';

type Item = (BitdefenderLicenseWithStatus | FortigateDeviceWithStatus) & { type: 'bitdefender' | 'fortigate' };

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: { itemIds: string[]; subject: string; body: string }) => Promise<void>;
  items: Item[];
  initialSelectedItems: Set<string>;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose, onSend, items, initialSelectedItems }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('Alerta de Vencimento de Licença');
  const [body, setBody] = useState(
    'Olá __CLIENT_NAME__,\n\nSua licença para o produto __PRODUCT__ está próxima do vencimento.\n\nPor favor, entre em contato para renovação.'
  );
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedItems(new Set(initialSelectedItems));
  }, [initialSelectedItems, isOpen]);

  if (!isOpen) return null;

  const handleSelectionChange = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const filteredItems = items.filter(item => {
    const name = item.type === 'bitdefender' ? item.company : item.client;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => `${item.type}-${item.id}`)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.size === 0) {
      toast.error('Por favor, selecione ao menos um cliente.');
      return;
    }
    setIsSending(true);
    await onSend({
      itemIds: Array.from(selectedItems),
      subject,
      body,
    });
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Enviar E-mail de Alerta</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 flex-grow overflow-y-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clientes</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selecione os clientes para quem deseja enviar o e-mail.</p>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              />
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="p-2">
                        <input type="checkbox" onChange={handleSelectAll} checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length} />
                      </th>
                      <th className="p-2 font-semibold">Cliente</th>
                      <th className="p-2 font-semibold">Produto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => {
                      const itemId = `${item.type}-${item.id}`;
                      const name = item.type === 'bitdefender' ? item.company : item.client;
                      return (
                        <tr key={itemId} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-2">
                            <input type="checkbox" checked={selectedItems.has(itemId)} onChange={() => handleSelectionChange(itemId)} />
                          </td>
                          <td className="p-2">{name}</td>
                          <td className="p-2 capitalize">{item.type}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedItems.size} cliente(s) selecionado(s).</p>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corpo do E-mail</label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use `__CLIENT_NAME__` e `__PRODUCT__` para personalização.
              </p>
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assinatura que será anexada:</p>
                <div className="p-2 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                  <img src="/signature.png" alt="Assinatura" className="max-w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSending || selectedItems.size === 0} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-400 flex items-center">
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Enviando...' : `Enviar para ${selectedItems.size} cliente(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;