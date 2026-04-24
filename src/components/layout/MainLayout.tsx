import React, { useState } from 'react';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import NotificationCenter from '../NotificationCenter';
import { User } from '../../types';

interface MainLayoutProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  user, 
  currentPage, 
  onNavigate, 
  onLogout, 
  children 
}) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notificationCount] = useState(3); // TODO: Get from API

  const handleSettingsClick = () => {
    onNavigate('settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <TopHeader
        user={user}
        notificationCount={notificationCount}
        onNotificationsClick={() => setIsNotificationCenterOpen(true)}
        onSettingsClick={handleSettingsClick}
        onLogout={onLogout}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="pt-16 pl-64 transition-all duration-300">
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
