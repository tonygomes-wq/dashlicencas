import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Layout, Settings, Key, Eye, EyeOff, CheckSquare, Square, Mail, Database, Monitor, Cloud, Network, Users } from 'lucide-react';
import { User, UserPermissions, UserRole, O365Client, GmailClient } from '../types';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (userId: number, data: any) => Promise<void>;
}

const defaultPermissions: UserPermissions = {
    dashboards: {
        bitdefender: true,
        fortigate: true,
        o365: true,
        gmail: true,
        network: true
    },
    actions: {
        edit: true,
        delete: true
    },
    client_access_all: {
        bitdefender: true,
        fortigate: true,
        o365: true,
        gmail: true,
        network: true
    },
    client_access: {
        bitdefender: [],
        fortigate: [],
        o365: [],
        gmail: []
    }
};

const EditUserModal = ({ isOpen, onClose, user, onSave }: EditUserModalProps) => {
    const [role, setRole] = useState<UserRole>('user');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
    const [isSaving, setIsSaving] = useState(false);

    const [availableItems, setAvailableItems] = useState<{
        bitdefender: string[];
        fortigate: string[];
        o365: O365Client[];
        gmail: GmailClient[];
    }>({
        bitdefender: [],
        fortigate: [],
        o365: [],
        gmail: []
    });
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setRole(user.role);

            // Migration and default handling
            let userPerms = { ...defaultPermissions, ...(user.permissions || {}) };

            // If client_access_all is a legacy boolean, migrate to object
            if (userPerms.client_access_all === undefined || typeof userPerms.client_access_all === 'boolean') {
                const globalVal = typeof userPerms.client_access_all === 'boolean' ? userPerms.client_access_all : true;
                userPerms.client_access_all = {
                    bitdefender: globalVal,
                    fortigate: globalVal,
                    o365: globalVal,
                    gmail: globalVal,
                    network: globalVal
                };
            }

            setPermissions(userPerms as UserPermissions);
            setPassword('');
            fetchAvailableItems();
        }
    }, [user, isOpen]);

    const fetchAvailableItems = async () => {
        setIsLoadingItems(true);
        try {
            const [bd, fg, o365, gmail] = await Promise.all([
                apiClient.bitdefender.list(),
                apiClient.fortigate.list(),
                apiClient.o365.clients.list(),
                apiClient.gmail.clients.list()
            ]);

            // Extract unique names for Bitdefender and Fortigate
            const bdCompanies = Array.from(new Set(bd.map((item: any) => item.company))).filter(Boolean) as string[];
            const fgClients = Array.from(new Set(fg.map((item: any) => item.client))).filter(Boolean) as string[];

            setAvailableItems({
                bitdefender: bdCompanies.sort(),
                fortigate: fgClients.sort(),
                o365: o365.sort((a: O365Client, b: O365Client) => a.clientName.localeCompare(b.clientName)),
                gmail: gmail.sort((a: GmailClient, b: GmailClient) => a.clientName.localeCompare(b.clientName))
            });
        } catch (error) {
            console.error('Error fetching items for permissions:', error);
            toast.error('Erro ao carregar lista de clientes para permissões');
        } finally {
            setIsLoadingItems(false);
        }
    };

    if (!isOpen || !user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updateData: any = {
                role,
                permissions
            };
            if (password) {
                updateData.password = password;
            }
            await onSave(user.id, updateData);
            onClose();
        } catch (error: any) {
            // Error toast handled by parent or apiClient
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDashboard = (key: keyof UserPermissions['dashboards']) => {
        setPermissions((prev: UserPermissions) => ({
            ...prev,
            dashboards: {
                ...prev.dashboards,
                [key]: !prev.dashboards[key]
            }
        }));
    };

    const toggleAction = (key: keyof UserPermissions['actions']) => {
        setPermissions((prev: UserPermissions) => ({
            ...prev,
            actions: {
                ...prev.actions,
                [key]: !prev.actions[key]
            }
        }));
    };

    const toggleItemAccessAll = (dashboard: string) => {
        setPermissions((prev: UserPermissions) => {
            const currentObj = (typeof prev.client_access_all === 'object' ? prev.client_access_all : {}) as Record<string, boolean>;
            return {
                ...prev,
                client_access_all: {
                    ...currentObj,
                    [dashboard]: !currentObj[dashboard]
                }
            };
        });
    };

    const toggleItemAccess = (dashboard: 'bitdefender' | 'fortigate' | 'o365' | 'gmail', itemId: string) => {
        setPermissions((prev: UserPermissions) => {
            const current = (prev.client_access?.[dashboard] || []) as string[];
            const updated = current.includes(itemId)
                ? current.filter((id: string) => id !== itemId)
                : [...current, itemId];

            return {
                ...prev,
                client_access: {
                    ...(prev.client_access || {}),
                    [dashboard]: updated
                }
            };
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Usuário</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Fechar modal"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex-grow overflow-auto p-6 space-y-8">

                    {/* Role & Password Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> Nível de Acesso
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                title="Selecione o papel do usuário"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            >
                                <option value="user">Usuário Comum</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                <Key className="w-4 h-4 mr-2" /> Resetar Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Deixe em branco para manter"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Access */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                            <Layout className="w-4 h-4 mr-2" /> Acesso aos Dashboards
                        </h3>
                        <div className="space-y-4">
                            {[
                                { id: 'bitdefender', label: 'Bitdefender', icon: Database, isItemDashboard: true },
                                { id: 'fortigate', label: 'Fortigate', icon: Monitor, isItemDashboard: true },
                                { id: 'o365', label: 'Office 365', icon: Cloud, isItemDashboard: true },
                                { id: 'gmail', label: 'Gmail', icon: Mail, isItemDashboard: true },
                                { id: 'network', label: 'Mapa de Rede', icon: Network, isItemDashboard: false }
                            ].map((db) => {
                                const isEnabled = permissions.dashboards[db.id as keyof UserPermissions['dashboards']];
                                const isAll = (permissions.client_access_all as Record<string, boolean>)?.[db.id] ?? true;

                                return (
                                    <div key={db.id} className="bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        {/* Main Dashboard Row */}
                                        <div className="flex items-center p-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleDashboard(db.id as keyof UserPermissions['dashboards'])}
                                                className={`flex items-center p-3 rounded-2xl border-2 transition-all flex-grow mr-4 ${isEnabled
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                                    }`}
                                            >
                                                <db.icon className="w-5 h-5 mr-3" />
                                                <span className="text-sm font-bold flex-grow text-left">{db.label}</span>
                                                {isEnabled ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>

                                            {isEnabled && db.isItemDashboard && (
                                                <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (!isAll) toggleItemAccessAll(db.id); }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${isAll
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        Tudo
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (isAll) toggleItemAccessAll(db.id); }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!isAll
                                                            ? 'bg-orange-600 text-white shadow-md'
                                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        Restrito
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Restricted Item List */}
                                        {isEnabled && db.isItemDashboard && !isAll && (
                                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Clientes Autorizados</span>
                                                        <Users className="w-3 h-3 text-orange-500" />
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1 pr-2 custom-scrollbar">
                                                        {(availableItems[db.id as keyof typeof availableItems] as any[]).map((item) => {
                                                            const id = typeof item === 'string' ? item : item.id;
                                                            const name = typeof item === 'string' ? item : item.clientName;
                                                            const isChecked = permissions.client_access?.[db.id as keyof UserPermissions['client_access']]?.includes(id);

                                                            return (
                                                                <label key={id} className={`flex items-center p-2 rounded-xl cursor-pointer transition-colors border ${isChecked
                                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => toggleItemAccess(db.id as any, id)}
                                                                        className="hidden"
                                                                    />
                                                                    {isChecked ? (
                                                                        <CheckSquare className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                                                    ) : (
                                                                        <Square className="w-3.5 h-3.5 mr-2 text-gray-300" />
                                                                    )}
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">{name}</span>
                                                                </label>
                                                            );
                                                        })}
                                                        {isLoadingItems && <p className="text-[10px] text-gray-500 italic py-2">Carregando...</p>}
                                                        {(availableItems[db.id as keyof typeof availableItems] as any[]).length === 0 && !isLoadingItems && (
                                                            <p className="text-[10px] text-gray-400 italic py-2">Nenhum item encontrado</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Permissions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                            <Settings className="w-4 h-4 mr-2" /> Permissões de Ação
                        </h3>
                        <div className="flex space-x-4">
                            {[
                                { id: 'edit', label: 'Pode Editar' },
                                { id: 'delete', label: 'Pode Excluir' }
                            ].map((action) => {
                                const isChecked = permissions.actions[action.id as keyof UserPermissions['actions']];
                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => toggleAction(action.id as keyof UserPermissions['actions'])}
                                        className={`flex items-center px-4 py-2 rounded-xl border-2 transition-all ${isChecked
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                            }`}
                                    >
                                        <span className="text-xs font-bold mr-3">{action.label}</span>
                                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Layout className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
