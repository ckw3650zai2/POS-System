import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { Cost, ExtraIncome } from '../types';
import { 
  getCosts, 
  saveCost, 
  updateCost, 
  deleteCost,
  getExtraIncomes,
  saveExtraIncome,
  updateExtraIncome,
  deleteExtraIncome
} from '../utils/storage';

const CostIncomeManagement: React.FC = () => {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [extraIncomes, setExtraIncomes] = useState<ExtraIncome[]>([]);
  const [activeTab, setActiveTab] = useState<'costs' | 'incomes'>('costs');
  
  // 成本表单状态
  const [costForm, setCostForm] = useState({
    name: '',
    amount: '',
    category: '原料成本' as Cost['category'],
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  // 收入表单状态
  const [incomeForm, setIncomeForm] = useState({
    name: '',
    amount: '',
    category: '服务费' as ExtraIncome['category'],
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCosts(getCosts());
    setExtraIncomes(getExtraIncomes());
  };

  const resetCostForm = () => {
    setCostForm({
      name: '',
      amount: '',
      category: '原料成本',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingCostId(null);
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      name: '',
      amount: '',
      category: '服务费',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingIncomeId(null);
  };

  const handleSaveCost = () => {
    if (!costForm.name || !costForm.amount) {
      alert('请填写成本名称和金额');
      return;
    }

    const costData: Cost = {
      id: editingCostId || Date.now().toString(),
      name: costForm.name,
      amount: parseFloat(costForm.amount),
      category: costForm.category,
      date: costForm.date,
      description: costForm.description,
      createdAt: new Date().toISOString()
    };

    if (editingCostId) {
      updateCost(editingCostId, costData);
    } else {
      saveCost(costData);
    }

    resetCostForm();
    loadData();
  };

  const handleSaveIncome = () => {
    if (!incomeForm.name || !incomeForm.amount) {
      alert('请填写收入名称和金额');
      return;
    }

    const incomeData: ExtraIncome = {
      id: editingIncomeId || Date.now().toString(),
      name: incomeForm.name,
      amount: parseFloat(incomeForm.amount),
      category: incomeForm.category,
      date: incomeForm.date,
      description: incomeForm.description,
      createdAt: new Date().toISOString()
    };

    if (editingIncomeId) {
      updateExtraIncome(editingIncomeId, incomeData);
    } else {
      saveExtraIncome(incomeData);
    }

    resetIncomeForm();
    loadData();
  };

  const handleEditCost = (cost: Cost) => {
    setCostForm({
      name: cost.name,
      amount: cost.amount.toString(),
      category: cost.category,
      date: cost.date,
      description: cost.description || ''
    });
    setEditingCostId(cost.id);
  };

  const handleEditIncome = (income: ExtraIncome) => {
    setIncomeForm({
      name: income.name,
      amount: income.amount.toString(),
      category: income.category,
      date: income.date,
      description: income.description || ''
    });
    setEditingIncomeId(income.id);
  };

  const handleDeleteCost = (costId: string) => {
    if (confirm('确定要删除这条成本记录吗？')) {
      deleteCost(costId);
      loadData();
    }
  };

  const handleDeleteIncome = (incomeId: string) => {
    if (confirm('确定要删除这条收入记录吗？')) {
      deleteExtraIncome(incomeId);
      loadData();
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '原料成本': 'bg-red-100 text-red-800',
      '人工成本': 'bg-orange-100 text-orange-800',
      '租金成本': 'bg-yellow-100 text-yellow-800',
      '设备成本': 'bg-blue-100 text-blue-800',
      '其他成本': 'bg-gray-100 text-gray-800',
      '服务费': 'bg-green-100 text-green-800',
      '配送费': 'bg-blue-100 text-blue-800',
      '其他收入': 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const totalExtraIncomes = extraIncomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {costs.length} 项成本记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">额外收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalExtraIncomes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {extraIncomes.length} 项收入记录
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 标签切换 */}
      <div className="flex space-x-2">
        <Button
          onClick={() => setActiveTab('costs')}
          variant={activeTab === 'costs' ? 'default' : 'outline'}
          className="flex items-center space-x-2"
        >
          <TrendingDown className="h-4 w-4" />
          <span>成本管理</span>
        </Button>
        <Button
          onClick={() => setActiveTab('incomes')}
          variant={activeTab === 'incomes' ? 'default' : 'outline'}
          className="flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>收入管理</span>
        </Button>
      </div>

      {/* 成本管理 */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          {/* 添加/编辑成本 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>{editingCostId ? '编辑成本' : '添加成本'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costName">成本名称</Label>
                  <Input
                    id="costName"
                    value={costForm.name}
                    onChange={(e) => setCostForm({ ...costForm, name: e.target.value })}
                    placeholder="例如: 茶叶采购"
                  />
                </div>
                <div>
                  <Label htmlFor="costAmount">金额</Label>
                  <Input
                    id="costAmount"
                    type="number"
                    step="0.01"
                    value={costForm.amount}
                    onChange={(e) => setCostForm({ ...costForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="costCategory">成本类别</Label>
                  <Select value={costForm.category} onValueChange={(value: Cost['category']) => setCostForm({ ...costForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="原料成本">原料成本</SelectItem>
                      <SelectItem value="人工成本">人工成本</SelectItem>
                      <SelectItem value="租金成本">租金成本</SelectItem>
                      <SelectItem value="设备成本">设备成本</SelectItem>
                      <SelectItem value="其他成本">其他成本</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costDate">日期</Label>
                  <Input
                    id="costDate"
                    type="date"
                    value={costForm.date}
                    onChange={(e) => setCostForm({ ...costForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="costDescription">备注说明</Label>
                <Textarea
                  id="costDescription"
                  value={costForm.description}
                  onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                  placeholder="可选的备注信息"
                  rows={2}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveCost} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{editingCostId ? '更新' : '保存'}</span>
                </Button>
                {editingCostId && (
                  <Button onClick={resetCostForm} variant="outline" className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>取消</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 成本列表 */}
          <Card>
            <CardHeader>
              <CardTitle>成本记录</CardTitle>
              <CardDescription>所有成本支出记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costs.length > 0 ? (
                  costs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{cost.name}</h4>
                            <Badge className={getCategoryColor(cost.category)}>
                              {cost.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(cost.date).toLocaleDateString('zh-CN')}</span>
                            </span>
                            {cost.description && (
                              <span>{cost.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              -{formatCurrency(cost.amount)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCost(cost)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCost(cost.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无成本记录</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 收入管理 */}
      {activeTab === 'incomes' && (
        <div className="space-y-6">
          {/* 添加/编辑收入 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>{editingIncomeId ? '编辑收入' : '添加额外收入'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incomeName">收入名称</Label>
                  <Input
                    id="incomeName"
                    value={incomeForm.name}
                    onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
                    placeholder="例如: 外卖配送费"
                  />
                </div>
                <div>
                  <Label htmlFor="incomeAmount">金额</Label>
                  <Input
                    id="incomeAmount"
                    type="number"
                    step="0.01"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="incomeCategory">收入类别</Label>
                  <Select value={incomeForm.category} onValueChange={(value: ExtraIncome['category']) => setIncomeForm({ ...incomeForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="服务费">服务费</SelectItem>
                      <SelectItem value="配送费">配送费</SelectItem>
                      <SelectItem value="其他收入">其他收入</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incomeDate">日期</Label>
                  <Input
                    id="incomeDate"
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="incomeDescription">备注说明</Label>
                <Textarea
                  id="incomeDescription"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="可选的备注信息"
                  rows={2}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveIncome} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{editingIncomeId ? '更新' : '保存'}</span>
                </Button>
                {editingIncomeId && (
                  <Button onClick={resetIncomeForm} variant="outline" className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>取消</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 收入列表 */}
          <Card>
            <CardHeader>
              <CardTitle>收入记录</CardTitle>
              <CardDescription>所有额外收入记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extraIncomes.length > 0 ? (
                  extraIncomes
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{income.name}</h4>
                            <Badge className={getCategoryColor(income.category)}>
                              {income.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(income.date).toLocaleDateString('zh-CN')}</span>
                            </span>
                            {income.description && (
                              <span>{income.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              +{formatCurrency(income.amount)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditIncome(income)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteIncome(income.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无收入记录</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CostIncomeManagement;
