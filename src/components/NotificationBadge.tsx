import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  onClick: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnreadCount();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/app_notifications.php?action=unread_count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar contagem');
      
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      title="Notificações"
    >
      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
