import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { Drink } from '../types';

const MenuManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    image: '',
    available: true
  });

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    setFormData({
      name: drink.name,
      price: drink.price,
      category: drink.category,
      image: drink.image,
      available: drink.available
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      price: 0,
      category: '',
      image: '',
      available: true
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || formData.price <= 0) {
      alert('请填写完整信息');
      return;
    }

    if (isCreating) {
      const newDrink: Drink = {
        id: `drink-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        category: formData.category,
        image: formData.image || '/images/default-drink.jpg',
        available: formData.available
      };
      dispatch({ type: 'ADD_DRINK', payload: newDrink });
    } else if (editingDrink) {
      const updatedDrink: Drink = {
        ...editingDrink,
        name: formData.name,
        price: formData.price,
        category: formData.category,
        image: formData.image,
        available: formData.available
      };
      dispatch({ type: 'UPDATE_DRINK', payload: updatedDrink });
    }

    setEditingDrink(null);
    setIsCreating(false);
    setFormData({ name: '', price: 0, category: '', image: '', available: true });
  };

  const handleCancel = () => {
    setEditingDrink(null);
    setIsCreating(false);
    setFormData({ name: '', price: 0, category: '', image: '', available: true });
  };

  const handleDelete = (drinkId: string) => {
    if (window.confirm('确定要删除这个饮料吗？')) {
      dispatch({ type: 'DELETE_DRINK', payload: drinkId });
    }
  };

  const handleToggleAvailability = (drink: Drink) => {
    const updatedDrink = { ...drink, available: !drink.available };
    dispatch({ type: 'UPDATE_DRINK', payload: updatedDrink });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = [...new Set(state.drinks.map(d => d.category))];

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">菜单管理</h2>
            <p className="text-gray-600 mt-1">管理饮料菜单和价格</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={20} />
            <span>添加饮料</span>
          </button>
        </div>
      </div>

      {/* 编辑表单 */}
      {(isCreating || editingDrink) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {isCreating ? '添加新饮料' : '编辑饮料'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                饮料名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="请输入饮料名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                价格
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="请输入价格"
                min="0"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="请输入分类"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="图片URL或路径"
                />
                <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 flex items-center">
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">可供应</span>
            </label>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Save size={16} />
              <span>保存</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              <X size={16} />
              <span>取消</span>
            </button>
          </div>
        </div>
      )}

      {/* 饮料列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">当前菜单 ({state.drinks.length} 项)</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {state.drinks.map((drink) => (
            <div key={drink.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={drink.image}
                  alt={drink.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{drink.name}</h4>
                  <p className="text-sm text-gray-600">{drink.category}</p>
                  <p className="text-lg font-bold text-orange-600">¥{drink.price}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  drink.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {drink.available ? '有售' : '缺货'}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAvailability(drink)}
                  className={`px-3 py-1 rounded text-sm ${
                    drink.available
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {drink.available ? '标记缺货' : '标记有售'}
                </button>
                <button
                  onClick={() => handleEdit(drink)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(drink.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
