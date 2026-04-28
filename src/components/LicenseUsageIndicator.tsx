import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface LicenseUsageIndicatorProps {
  usedSlots: number;
  totalSlots: number;
  usagePercent?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LicenseUsageIndicator: React.FC<LicenseUsageIndicatorProps> = ({
  usedSlots,
  totalSlots,
  usagePercent,
  showDetails = true,
  size = 'md'
}) => {
  // Calcular percentual se não fornecido
  const percent = usagePercent ?? (totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0);
  const freeSlots = Math.max(0, totalSlots - usedSlots);
  const overLimit = usedSlots > totalSlots;

  // Determinar cor e ícone baseado no uso
  let colorClass = 'text-green-600 dark:text-green-400';
  let bgClass = 'bg-green-50 dark:bg-green-900/20';
  let borderClass = 'border-green-200 dark:border-green-800';
  let Icon = CheckCircle;
  let status = 'OK';

  if (overLimit) {
    colorClass = 'text-red-600 dark:text-red-400';
    bgClass = 'bg-red-50 dark:bg-red-900/20';
    borderClass = 'border-red-200 dark:border-red-800';
    Icon = AlertCircle;
    status = 'LIMITE EXCEDIDO';
  } else if (percent >= 90) {
    colorClass = 'text-orange-600 dark:text-orange-400';
    bgClass = 'bg-orange-50 dark:bg-orange-900/20';
    borderClass = 'border-orange-200 dark:border-orange-800';
    Icon = AlertTriangle;
    status = 'USO ALTO';
  } else if (percent >= 70) {
    colorClass = 'text-yellow-600 dark:text-yellow-400';
    bgClass = 'bg-yellow-50 dark:bg-yellow-900/20';
    borderClass = 'border-yellow-200 dark:border-yellow-800';
    Icon = AlertTriangle;
    status = 'ATENÇÃO';
  }

  // Tamanhos
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5'
    },
    md: {
      container: 'px-3 py-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      badge: 'text-xs px-2 py-0.5'
    },
    lg: {
      container: 'px-4 py-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      badge: 'text-sm px-2.5 py-1'
    }
  };

  const sizes = sizeClasses[size];

  if (!showDetails) {
    // Versão compacta - apenas badge
    return (
      <span className={`inline-flex items-center gap-1 ${sizes.badge} rounded-full font-semibold ${bgClass} ${colorClass} ${borderClass} border`}>
        <Icon className={sizes.icon} />
        {percent}%
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizes.container} rounded-lg ${bgClass} ${borderClass} border`}>
      <Icon className={`${sizes.icon} ${colorClass}`} />
      <div className="flex flex-col">
        <div className={`${sizes.text} font-semibold ${colorClass}`}>
          {usedSlots} / {totalSlots} assentos
        </div>
        {overLimit ? (
          <div className={`${sizes.badge} ${colorClass} font-medium`}>
            ⚠️ {status}
          </div>
        ) : (
          <div className={`${sizes.badge} text-gray-600 dark:text-gray-400`}>
            {freeSlots} disponíveis ({percent}%)
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseUsageIndicator;
