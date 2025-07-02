import React from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Minus, Plus } from 'lucide-react';

const CurrentOrder: React.FC = () => {
  const { state, dispatch } = useApp();
  const { currentOrder } = state;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ORDER_ITEM', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_ORDER_ITEM', payload: { id: itemId, updates: { quantity: newQuantity } } });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ORDER_ITEM', payload: itemId });
  };

  const handleSubmitOrder = () => {
    if (currentOrder.items.length === 0) return;
    
    dispatch({ type: 'SUBMIT_ORDER' });
    
    // 显示成功提示
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = '订单提交成功！';
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const handleClearOrder = () => {
    dispatch({ type: 'CLEAR_CURRENT_ORDER' });
  };

  if (currentOrder.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">当前订单</h2>
        <div className="text-center py-8 text-gray-500">
          <p>还没有选择任何饮料</p>
          <p className="text-sm mt-2">点击左侧饮料卡片开始下单</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">当前订单</h2>
        <button
          onClick={handleClearOrder}
          className="text-gray-500 hover:text-red-500 p-1"
          title="清空订单"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {currentOrder.items.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{item.drinkName}</h4>
                <p className="text-sm text-gray-600">
                  {item.sugar} · {item.ice}
                </p>
                <p className="text-sm font-medium text-orange-600">
                  ${item.price} × {item.quantity} = ${item.subtotal}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-800">总计</span>
          <span className="text-2xl font-bold text-orange-600">${currentOrder.total}</span>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleSubmitOrder}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            提交订单
          </button>
          <button
            onClick={handleClearOrder}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            清空订单
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentOrder;
