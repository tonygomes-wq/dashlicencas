import React from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  Flame, 
  Mail, 
  AtSign, 
  Network, 
  HardDrive, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, isCollapsed, onToggleCollapse }) => {

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'bitdefender', label: 'Bitdefender', icon: <Shield className="w-5 h-5" />, color: 'text-red-600 dark:text-red-400' },
    { id: 'fortigate', label: 'Fortigate', icon: <Flame className="w-5 h-5" />, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'office365', label: 'Office 365', icon: <Mail className="w-5 h-5" />, color: 'text-blue-500 dark:text-blue-300' },
    { id: 'gmail', label: 'Gmail', icon: <AtSign className="w-5 h-5" />, color: 'text-red-500 dark:text-red-300' },
    { id: 'network', label: 'Mapa de Rede', icon: <Network className="w-5 h-5" />, color: 'text-green-600 dark:text-green-400' },
    { id: 'inventory', label: 'Inventário', icon: <HardDrive className="w-5 h-5" />, color: 'text-purple-600 dark:text-purple-400' },
  ];

  const bottomItems: MenuItem[] = [
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" />, color: 'text-gray-600 dark:text-gray-400' },
  ];

  return (
    <aside 
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] 
        bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        z-30
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Menu Items */}
      <nav className="flex flex-col h-full py-6">
        <div className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200
                ${currentPage === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={currentPage === item.id ? item.color : ''}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Items */}
        <div className="px-3 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200
                ${currentPage === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={currentPage === item.id ? item.color : ''}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}

          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Sair</span>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
