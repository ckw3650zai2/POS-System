import React, { useState } from 'react';
import { ClipboardList, Menu, ArrowLeft, BarChart3, DollarSign, Cloud } from 'lucide-react';
import OrderManagement from '../components/OrderManagement';
import MenuManagement from '../components/MenuManagement';
import SalesAnalytics from '../components/SalesAnalytics';
import CostIncomeManagement from '../components/CostIncomeManagement';
import CloudSyncManagement from '../components/CloudSyncManagement';

const ManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'finance' | 'sync'>('orders');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* 导航栏 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClipboardList size={16} />
                <span>订单管理</span>
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Menu size={16} />
                <span>菜单管理</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 size={16} />
                <span>销售分析</span>
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'finance'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign size={16} />
                <span>成本收入</span>
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'sync'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Cloud size={16} />
                <span>云端同步</span>
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div>
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'analytics' && <SalesAnalytics />}
          {activeTab === 'finance' && <CostIncomeManagement />}
          {activeTab === 'sync' && <CloudSyncManagement />}
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;
