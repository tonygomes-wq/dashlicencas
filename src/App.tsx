import React, { useState, useEffect } from 'react';
import { apiClient } from './lib/apiClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { LoaderCircle } from 'lucide-react';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const data = await apiClient.auth.checkSession();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoaderCircle className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    // Passamos o setUser para o Login para que ele possa atualizar o estado
    return <Login onLoginSuccess={(u: User) => setUser(u)} />;
  }

  return (
    <Dashboard key={user.id} user={user} />
  );
};

export default App;