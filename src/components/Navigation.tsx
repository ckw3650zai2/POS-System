import React from 'react';
import { Coffee, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: 'order' | 'management';
  onViewChange: (view: 'order' | 'management') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-2 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewChange('order')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
              currentView === 'order'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Coffee size={20} />
            <span className="hidden sm:inline">点单</span>
          </button>
          <button
            onClick={() => onViewChange('management')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
              currentView === 'management'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={20} />
            <span className="hidden sm:inline">管理</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
