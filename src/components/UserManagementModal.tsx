import React, { useState, useEffect } from 'react';
import { X, Users, Edit2, Trash2, Power, PowerOff, Shield, ShieldAlert, Plus, LoaderCircle, Mail } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { User } from '../types';
import toast from 'react-hot-toast';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.users.list();
            setUsers(data);
        } catch (error: any) {
            toast.error('Erro ao carregar usuários: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (data: any) => {
        try {
            await apiClient.users.create(data);
            toast.success('Usuário criado com sucesso!');
            loadUsers();
        } catch (error: any) {
            toast.error('Erro ao criar usuário: ' + error.message);
            throw error;
        }
    };

    const handleUpdateUser = async (userId: number, data: any) => {
        const toastId = toast.loading('Atualizando usuário...');
        try {
            await apiClient.users.update(userId, data);
            toast.success('Usuário atualizado com sucesso!', { id: toastId });
            loadUsers();
        } catch (error: any) {
            toast.error('Erro ao atualizar usuário: ' + error.message, { id: toastId });
            throw error;
        }
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.is_active;
        const toastId = toast.loading('Atualizando status...');
        try {
            await apiClient.users.update(user.id, { is_active: newStatus });
            toast.success(`Usuário ${newStatus ? 'ativado' : 'desativado'}!`, { id: toastId });
            loadUsers();
        } catch (error: any) {
            toast.error('Erro ao atualizar status: ' + error.message, { id: toastId });
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Tem certeza que deseja excluir o usuário ${user.email}?`)) return;

        const toastId = toast.loading('Excluindo usuário...');
        try {
            await apiClient.users.remove(user.id);
            toast.success('Usuário excluído!', { id: toastId });
            loadUsers();
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message, { id: toastId });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100 border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciamento de Usuários</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Controle quem pode acessar o dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Usuário
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-auto p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoaderCircle className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Carregando lista de acessos...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 ${user.is_active
                                        ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-xl'
                                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-75'
                                        }`}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2 rounded-xl ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                                {user.role === 'admin' ?
                                                    <Shield className={`w-5 h-5 ${user.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} /> :
                                                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                }
                                            </div>
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditUserModalOpen(true);
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Editar Permissões"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={user.id === currentUser.id}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    title={user.is_active ? "Desativar" : "Ativar"}
                                                >
                                                    {user.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={user.id === currentUser.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate" title={user.email}>{user.email}</h3>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    {user.is_active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                            <p className="text-[10px] text-gray-400">
                                                Último acesso: <br />
                                                <span className="text-gray-500 dark:text-gray-300 font-mono">
                                                    {user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'Nunca'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {user.id === currentUser.id && (
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                VOCÊ
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                        * Apenas administradores podem gerenciar usuários. Alterações são registradas em log.
                    </p>
                </div>
            </div>

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSave={handleCreateUser}
            />

            <EditUserModal
                isOpen={isEditUserModalOpen}
                onClose={() => {
                    setIsEditUserModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSave={handleUpdateUser}
            />
        </div>
    );
};

export default UserManagementModal;
