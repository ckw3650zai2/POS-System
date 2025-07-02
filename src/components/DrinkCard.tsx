import React, { useState } from 'react';
import { Drink, OrderItem } from '../types';
import { useApp } from '../context/AppContext';

interface DrinkCardProps {
  drink: Drink;
}

const DrinkCard: React.FC<DrinkCardProps> = ({ drink }) => {
  const { dispatch } = useApp();
  const [showOptions, setShowOptions] = useState(false);
  const [sugar, setSugar] = useState<'无糖' | '少糖' | '半糖' | '正常'>('正常');
  const [ice, setIce] = useState<'去冰' | '少冰' | '正常冰'>('正常冰');
  const [quantity, setQuantity] = useState(1);

  const handleAddToOrder = () => {
    const orderItem: OrderItem = {
      id: `${drink.id}-${Date.now()}`,
      drinkId: drink.id,
      drinkName: drink.name,
      price: drink.price,
      quantity,
      sugar,
      ice,
      subtotal: drink.price * quantity
    };

    dispatch({ type: 'ADD_ORDER_ITEM', payload: orderItem });
    setShowOptions(false);
    setQuantity(1);
    
    // 显示添加成功提示
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = `已添加 ${drink.name}`;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  if (!drink.available) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 opacity-50">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
        <h3 className="font-semibold text-gray-500">{drink.name}</h3>
        <p className="text-gray-400">暂时缺货</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-200"
        onClick={() => setShowOptions(true)}
      >
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
        <h3 className="font-semibold text-gray-800 mb-1">{drink.name}</h3>
        <p className="text-orange-600 font-bold text-lg">¥{drink.price}</p>
      </div>

      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <img
                src={drink.image}
                alt={drink.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="font-semibold text-lg">{drink.name}</h3>
                <p className="text-orange-600 font-bold">${drink.price}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 糖度选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">糖度</label>
                <div className="grid grid-cols-4 gap-2">
                  {['无糖', '少糖', '半糖', '正常'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSugar(option as any)}
                      className={`py-2 px-3 rounded text-sm ${
                        sugar === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 冰块选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">冰块</label>
                <div className="grid grid-cols-3 gap-2">
                  {['去冰', '少冰', '正常冰'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setIce(option as any)}
                      className={`py-2 px-3 rounded text-sm ${
                        ice === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 数量选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddToOrder}
                className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
              >
                添加到订单 ¥{(drink.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrinkCard;
