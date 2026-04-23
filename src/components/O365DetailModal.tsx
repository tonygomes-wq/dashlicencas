import React, { useState, useEffect, useMemo } from 'react';
import { X, Mail, User, Key, Lock, Save, XCircle, LoaderCircle, PlusCircle, Trash2, FileUp, Eye, EyeOff } from 'lucide-react';
import { O365Client, O365License, O365LicenseWithClient, RenewalStatus } from '../types';
import toast from 'react-hot-toast';
import ImportLicensesModal from './ImportLicensesModal'; // Importando o novo modal

interface O365DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: O365Client | null;
    licenses: O365LicenseWithClient[];
    onLicenseUpdate: (id: number, data: Partial<O365License>) => Promise<void>;
    onLicenseRemove: (id: number) => Promise<void>;
    onAddLicense: (clientId: string, licenseData: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>) => Promise<void>;
    onBulkImport: (clientId: string, licenses: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[]) => Promise<void>; // Nova prop
    isAdmin: boolean;
}

const RenewalBadge: React.FC<{ status: RenewalStatus }> = ({ status }) => {
    const baseClasses = 'px-2 py-1 text-xs font-bold rounded-full inline-block';
    const statusConfig = {
        'Pendente': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'Em Negociação': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Renovado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Cancelado': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`${baseClasses} ${statusConfig[status]}`}>{status}</span>;
};

const renewalStatusOptions: RenewalStatus[] = ['Pendente', 'Em Negociação', 'Renovado', 'Cancelado'];

const initialNewLicenseState: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'> = {
    username: '',
    email: '',
    password: '',
    licenseType: '',
};

const O365DetailModal: React.FC<O365DetailModalProps> = ({ isOpen, onClose, client, licenses, onLicenseUpdate, onLicenseRemove, onAddLicense, onBulkImport, isAdmin }) => {
    const [editingLicenseId, setEditingLicenseId] = useState<number | null>(null);
    const [tempEditData, setTempEditData] = useState<Partial<O365License>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [newLicenseForm, setNewLicenseForm] = useState(initialNewLicenseState);
    const [showPassword, setShowPassword] = useState<Record<number, boolean>>({}); // { licenseId: boolean }

    // Novos estados para filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- HOOKS MOVIDOS PARA O TOPO ---

    const clientLicenses = useMemo(() => {
        if (!client) return [];
        return licenses.filter(license => license.clientId === client.id);
    }, [licenses, client]);

    const filteredLicenses = useMemo(() => {
        let filtered = clientLicenses;

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(license =>
                license.username.toLowerCase().includes(lowerCaseSearch) ||
                license.email.toLowerCase().includes(lowerCaseSearch) ||
                license.licenseType.toLowerCase().includes(lowerCaseSearch)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(license => license.renewalStatus === statusFilter);
        }

        return filtered;
    }, [clientLicenses, searchTerm, statusFilter]);

    // --- FIM DOS HOOKS MOVIDOS ---

    useEffect(() => {
        // Limpa o estado de edição e adição ao fechar o modal
        if (!isOpen) {
            setEditingLicenseId(null);
            setTempEditData({});
            setIsAdding(false);
            setNewLicenseForm(initialNewLicenseState);
            setIsImportModalOpen(false);
            setShowPassword({}); // Limpa o estado de visualização de senha
            setSearchTerm(''); // Limpa filtro
            setStatusFilter('all'); // Limpa filtro
        }
    }, [isOpen]);

    if (!isOpen || !client) return null;

    // A variável clientLicenses agora é definida via useMemo acima.
    // const clientLicenses = licenses.filter(license => license.clientId === client.id); 

    const handleEditClick = (license: O365License) => {
        setEditingLicenseId(license.id);
        setTempEditData({
            renewalStatus: license.renewalStatus,
            password: license.password || '',
            licenseType: license.licenseType || '',
            username: license.username || '',
            email: license.email || '',
        });
        setIsAdding(false); // Fecha o formulário de adição se estiver aberto
    };

    const handleCancelEdit = () => {
        setEditingLicenseId(null);
        setTempEditData({});
    };

    const handleTempChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTempEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async (license: O365License) => {
        if (!isAdmin) {
            toast.error("Você não tem permissão para editar este registro.");
            return;
        }

        const updates: Partial<O365License> = {};
        let hasChanges = false;

        // 1. Verifica Status de Renovação
        if (tempEditData.renewalStatus && tempEditData.renewalStatus !== license.renewalStatus) {
            updates.renewalStatus = tempEditData.renewalStatus;
            hasChanges = true;
        }

        // 2. Verifica Senha
        const newPassword = tempEditData.password === '' ? null : tempEditData.password;
        if (newPassword !== license.password) {
            updates.password = newPassword;
            hasChanges = true;
        }

        // 3. Verifica Tipo de Licença
        if (tempEditData.licenseType !== undefined && tempEditData.licenseType !== license.licenseType) {
            updates.licenseType = tempEditData.licenseType;
            hasChanges = true;
        }

        // 4. Verifica Usuário
        if (tempEditData.username !== undefined && tempEditData.username !== license.username) {
            updates.username = tempEditData.username;
            hasChanges = true;
        }

        // 5. Verifica Email
        if (tempEditData.email !== undefined && tempEditData.email !== license.email) {
            updates.email = tempEditData.email;
            hasChanges = true;
        }

        if (hasChanges) {
            setIsSaving(true);
            await onLicenseUpdate(license.id, updates);
            setIsSaving(false);
        }

        setEditingLicenseId(null);
        setTempEditData({});
    };

    const handleDeleteClick = async (license: O365License) => {
        if (!isAdmin) {
            toast.error("Você não tem permissão para remover registros.");
            return;
        }

        const confirmed = window.confirm(`Tem certeza que deseja remover a licença de ${license.username}? Esta ação não pode ser desfeita.`);
        if (confirmed) {
            setIsSaving(true);
            await onLicenseRemove(license.id);
            setIsSaving(false);
        }
    };

    const handleNewLicenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLicenseForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error("Você não tem permissão para adicionar registros.");
            return;
        }
        if (!newLicenseForm.username || !newLicenseForm.email || !newLicenseForm.licenseType) {
            toast.error("Usuário, Email e Tipo de Licença são obrigatórios.");
            return;
        }

        setIsSaving(true);
        await onAddLicense(client.id, {
            ...newLicenseForm,
            password: newLicenseForm.password || null,
        });
        setIsSaving(false);

        // Resetar formulário e fechar a seção de adição
        setNewLicenseForm(initialNewLicenseState);
        setIsAdding(false);
    };

    const handleBulkImport = async (licenses: Omit<O365License, 'id' | 'clientId' | 'renewalStatus'>[]) => {
        if (!client) return;
        await onBulkImport(client.id, licenses);
    };

    const togglePasswordVisibility = (licenseId: number) => {
        setShowPassword(prev => ({
            ...prev,
            [licenseId]: !prev[licenseId]
        }));
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-full w-full mx-4 lg:mx-8 transform transition-all flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Licenças do Cliente: {client.clientName}
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 flex-grow overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p><strong>Email de Contato:</strong> {client.contactEmail || 'N/A'}</p>
                            <p><strong>Total de Licenças:</strong> {clientLicenses.length}</p>
                        </div>

                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Usuários e Status de Renovação</h3>
                            {isAdmin && (
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsImportModalOpen(true);
                                            setIsAdding(false);
                                        }}
                                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        <FileUp className="w-4 h-4 mr-1" /> Importar Planilha
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(prev => !prev);
                                            setEditingLicenseId(null); // Fecha edição se abrir adição
                                        }}
                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-1" /> {isAdding ? 'Cancelar Adição' : 'Adicionar Licença'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <input
                                type="text"
                                placeholder="Buscar por Usuário, Email ou Tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-3 py-2 border rounded dark:bg-gray-600 dark:text-white text-sm flex-grow min-w-[200px]"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded dark:bg-gray-600 dark:text-white text-sm min-w-[150px]"
                            >
                                <option value="all">Todos os Status</option>
                                {renewalStatusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 dark:text-gray-400 self-center">
                                {filteredLicenses.length} de {clientLicenses.length} licenças visíveis.
                            </p>
                        </div>

                        {/* Formulário de Adição de Nova Licença */}
                        {isAdding && isAdmin && (
                            <form onSubmit={handleSaveNewLicense} className="p-4 border border-green-400 rounded-lg bg-green-50 dark:bg-green-900/30 space-y-3">
                                <h4 className="font-semibold text-green-800 dark:text-green-300">Nova Licença</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <input type="text" name="username" placeholder="Usuário *" value={newLicenseForm.username} onChange={handleNewLicenseChange} required className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white text-sm" />
                                    <input type="email" name="email" placeholder="Email *" value={newLicenseForm.email} onChange={handleNewLicenseChange} required className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white text-sm" />
                                    <input type="text" name="licenseType" placeholder="Tipo de Licença *" value={newLicenseForm.licenseType} onChange={handleNewLicenseChange} required className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white text-sm" />
                                    <input type="password" name="password" placeholder="Senha (Opcional)" value={newLicenseForm.password || ''} onChange={handleNewLicenseChange} className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white text-sm" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center">
                                        {isSaving ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Salvar Nova Licença
                                    </button>
                                </div>
                            </form>
                        )}

                        {filteredLicenses.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg dark:border-gray-600">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Usuário</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Tipo de Licença</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Senha</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Renovação</th>
                                            <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 w-20">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLicenses.map(license => {
                                            const isEditing = editingLicenseId === license.id;
                                            const isPasswordVisible = showPassword[license.id];
                                            return (
                                                <tr key={license.id} className="border-t dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800">
                                                    {/* Coluna Usuário */}
                                                    <td className="px-4 py-3">
                                                        {isEditing && isAdmin ? (
                                                            <div className="flex items-center space-x-2">
                                                                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <input
                                                                    type="text"
                                                                    name="username"
                                                                    value={tempEditData.username || ''}
                                                                    onChange={handleTempChange}
                                                                    placeholder="Usuário"
                                                                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm w-full"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="truncate">{license.username}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Coluna Email */}
                                                    <td className="px-4 py-3">
                                                        {isEditing && isAdmin ? (
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    value={tempEditData.email || ''}
                                                                    onChange={handleTempChange}
                                                                    placeholder="Email"
                                                                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm w-full"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="truncate">{license.email}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Coluna Tipo de Licença */}
                                                    <td className="px-4 py-3">
                                                        {isEditing && isAdmin ? (
                                                            <input
                                                                type="text"
                                                                name="licenseType"
                                                                value={tempEditData.licenseType || ''}
                                                                onChange={handleTempChange}
                                                                placeholder="Tipo de Licença"
                                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm w-full"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center space-x-1">
                                                                <Key className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span>{license.licenseType || 'N/A'}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Coluna Senha */}
                                                    <td className="px-4 py-3">
                                                        {isEditing && isAdmin ? (
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                value={tempEditData.password || ''}
                                                                onChange={handleTempChange}
                                                                placeholder="Nova Senha (opcional)"
                                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm w-32"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center space-x-1">
                                                                {license.password ? (
                                                                    <>
                                                                        <span className="font-mono text-xs">
                                                                            {isPasswordVisible ? license.password : '********'}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => togglePasswordVisibility(license.id)}
                                                                            className="p-1 text-gray-500 hover:text-blue-600"
                                                                            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                                                                        >
                                                                            {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Coluna Renovação */}
                                                    <td className="px-4 py-3">
                                                        {isEditing && isAdmin ? (
                                                            <select
                                                                name="renewalStatus"
                                                                value={tempEditData.renewalStatus || 'Pendente'}
                                                                onChange={handleTempChange}
                                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                                                            >
                                                                {renewalStatusOptions.map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <RenewalBadge status={license.renewalStatus} />
                                                        )}
                                                    </td>
                                                    {/* Coluna Ações */}
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        {isAdmin && (
                                                            isEditing ? (
                                                                <div className="flex space-x-2 justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSaveEdit(license)}
                                                                        disabled={isSaving}
                                                                        className="text-green-600 hover:text-green-800 font-semibold text-sm disabled:opacity-50"
                                                                    >
                                                                        {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleCancelEdit}
                                                                        disabled={isSaving}
                                                                        className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex space-x-2 justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditClick(license)}
                                                                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                                                        title="Editar"
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteClick(license)}
                                                                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                                                        title="Remover"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma licença encontrada com os filtros aplicados.</p>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Fechar</button>
                    </div>
                </div>
            </div>
            {isImportModalOpen && (
                <ImportLicensesModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleBulkImport}
                />
            )}
        </>
    );
};

export default O365DetailModal;