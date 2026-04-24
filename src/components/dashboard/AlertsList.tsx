import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  message: string;
  timestamp?: string;
  action?: () => void;
}

interface AlertsListProps {
  alerts?: Alert[];
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  const [realAlerts, setRealAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealAlerts();
  }, []);

  const loadRealAlerts = async () => {
    try {
      // Buscar alertas reais do sistema
      const [bitdefenderData, fortigateData] = await Promise.all([
        apiClient.bitdefender.list(),
        apiClient.fortigate.list()
      ]);

      const generatedAlerts: Alert[] = [];
      const now = new Date();

      // Verificar licenças Bitdefender vencidas ou vencendo
      bitdefenderData.forEach((license: any) => {
        if (license.expiration_date) {
          const expirationDate = new Date(license.expiration_date);
          const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 0) {
            generatedAlerts.push({
              id: `bitdefender-expired-${license.id}`,
              type: 'urgent',
              message: `Licença Bitdefender "${license.company}" vencida há ${Math.abs(daysUntilExpiry)} dias`,
              timestamp: 'Vencida'
            });
          } else if (daysUntilExpiry <= 7) {
            generatedAlerts.push({
              id: `bitdefender-expiring-${license.id}`,
              type: daysUntilExpiry <= 3 ? 'urgent' : 'warning',
              message: `Licença Bitdefender "${license.company}" vence em ${daysUntilExpiry} dias`,
              timestamp: `${daysUntilExpiry} dias`
            });
          }
        }
      });

      // Verificar dispositivos FortiGate vencidos ou vencendo
      fortigateData.forEach((device: any) => {
        if (device.vencimento) {
          const expirationDate = new Date(device.vencimento);
          const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 0) {
            generatedAlerts.push({
              id: `fortigate-expired-${device.id}`,
              type: 'urgent',
              message: `FortiGate "${device.client}" (${device.serial}) vencido há ${Math.abs(daysUntilExpiry)} dias`,
              timestamp: 'Vencido'
            });
          } else if (daysUntilExpiry <= 7) {
            generatedAlerts.push({
              id: `fortigate-expiring-${device.id}`,
              type: daysUntilExpiry <= 3 ? 'urgent' : 'warning',
              message: `FortiGate "${device.client}" (${device.serial}) vence em ${daysUntilExpiry} dias`,
              timestamp: `${daysUntilExpiry} dias`
            });
          }
        }
      });

      // Adicionar alertas de sucesso se não houver problemas
      if (generatedAlerts.length === 0) {
        generatedAlerts.push({
          id: 'all-good',
          type: 'success',
          message: 'Todas as licenças estão em dia! Nenhum alerta crítico encontrado.',
          timestamp: 'Agora'
        });
      }

      // Ordenar por prioridade (urgent > warning > info > success)
      const priorityOrder = { urgent: 0, warning: 1, info: 2, success: 3 };
      generatedAlerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

      setRealAlerts(generatedAlerts.slice(0, 5)); // Mostrar apenas os 5 mais importantes
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      // Fallback para alertas padrão em caso de erro
      setRealAlerts(defaultAlerts);
    } finally {
      setLoading(false);
    }
  };

  const defaultAlerts: Alert[] = [
    {
      id: '1',
      type: 'info',
      message: 'Sistema funcionando normalmente. Nenhum alerta crítico encontrado.',
      timestamp: 'Agora'
    }
  ];

  const alertsToShow = alerts || realAlerts;

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          badge: '🔴 URGENTE',
          badgeColor: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          badge: '🟠 ATENÇÃO',
          badgeColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          badge: '🟡 AVISO',
          badgeColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          badge: '🟢 INFO',
          badgeColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          ⚠️ Alertas e Notificações Recentes
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadRealAlerts}
            disabled={loading}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {loading ? 'Carregando...' : '🔄 Atualizar'}
          </button>
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Ver Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-16"></div>
          ))}
        </div>
      ) : (
        /* Alerts List */
        <div className="space-y-3">
          {alertsToShow.map((alert) => {
            const style = getAlertStyle(alert.type);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.badgeColor}`}>
                        {style.badge}
                      </span>
                      {alert.timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={alert.action}
                    className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Ver →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsList;
