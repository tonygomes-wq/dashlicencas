import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ScrollerProps {
  items: string[];
}

const Scroller: React.FC<ScrollerProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  // Cria uma longa string com separadores para uma animação contínua
  const scrollerContent = items.map(item => ` ${item} `).join(' • ');

  return (
    <div className="relative flex items-center h-full max-w-full overflow-hidden bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700">
      <div className="flex-shrink-0 px-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-grow py-2 overflow-hidden">
        {/* O div pai cria o escopo da animação */}
        <div className="animate-marquee whitespace-nowrap">
          {/* O conteúdo é duplicado para um loop perfeito */}
          <span className="mx-8">{scrollerContent}</span>
          <span className="mx-8">{scrollerContent}</span>
        </div>
      </div>
    </div>
  );
};

export default Scroller;