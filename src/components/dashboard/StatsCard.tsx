import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  onViewDetails?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  icon: Icon, 
  iconColor, 
  stats, 
  onViewDetails 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${iconColor} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}:
            </span>
            <span className={`text-sm font-semibold ${stat.color || 'text-gray-900 dark:text-white'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* View Details Button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-4 w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          Ver Detalhes →
        </button>
      )}
    </div>
  );
};

export default StatsCard;
