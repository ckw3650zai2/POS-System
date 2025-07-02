import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DrinkCard from '../components/DrinkCard';
import CurrentOrder from '../components/CurrentOrder';
import { Search } from 'lucide-react';

const OrderPage: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const availableDrinks = state.drinks.filter(drink => drink.available);
  const categories = ['all', ...new Set(availableDrinks.map(drink => drink.category))];
  
  const filteredDrinks = availableDrinks.filter(drink => {
    const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6">
        {/* 标题栏 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">☕ 街边饮料摊</h1>
          <p className="text-gray-600">新鲜现制，温暖每一天</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：饮料菜单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 搜索和分类筛选 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="搜索饮料..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? '全部' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 饮料卡片网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredDrinks.map((drink) => (
                <DrinkCard key={drink.id} drink={drink} />
              ))}
            </div>

            {filteredDrinks.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">没有找到匹配的饮料</p>
                <p className="text-sm text-gray-400 mt-2">
                  尝试更改搜索词或选择其他分类
                </p>
              </div>
            )}
          </div>

          {/* 右侧：当前订单 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CurrentOrder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
