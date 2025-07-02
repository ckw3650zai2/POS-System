import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, Trash2, Download, X } from 'lucide-react';
import { exportOrdersToCSV, clearAllOrders } from '../utils/storage';

const OrderManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | '待处理' | '已完成'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = state.orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const handleStatusChange = (orderId: string, status: '待处理' | '已完成') => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      dispatch({ type: 'DELETE_ORDER', payload: orderId });
    }
  };

  const handleExportOrders = () => {
    const csvData = exportOrdersToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `订单数据_${new Date().toLocaleDateString('zh-CN')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllOrders = () => {
    if (window.confirm('确定要清空所有订单吗？此操作不可恢复！')) {
      clearAllOrders();
      dispatch({ type: 'SET_ORDERS', payload: [] });
    }
  };

  const pendingCount = state.orders.filter(o => o.status === '待处理').length;
  const completedCount = state.orders.filter(o => o.status === '已完成').length;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">待处理</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">总订单</p>
              <p className="text-2xl font-semibold text-gray-900">{state.orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            {(['all', '待处理', '已完成'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : status}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={state.orders.length === 0}
            >
              <Download size={16} />
              <span>导出CSV</span>
            </button>
            <button
              onClick={handleClearAllOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={state.orders.length === 0}
            >
              <Trash2 size={16} />
              <span>清空全部</span>
            </button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>暂无{filter === 'all' ? '' : filter}订单</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      order.status === '待处理' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-900">订单 #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.timestamp.toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg text-orange-600">
                      ${order.total}
                    </span>
                    <div className="flex space-x-2">
                      {order.status === '待处理' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, '已完成');
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          完成
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, '待处理');
                          }}
                          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                        >
                          重新处理
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                
                {selectedOrder === order.id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">订单详情</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{item.drinkName}</span>
                            <span className="text-gray-600 ml-2">
                              {item.sugar} · {item.ice} × {item.quantity}
                            </span>
                          </div>
                          <span className="font-medium">${item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
