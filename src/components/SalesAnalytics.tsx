import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  FileBarChart
} from 'lucide-react';
import { DateRange } from '../types';
import { 
  getSalesAnalytics, 
  getProfitAnalysis,
  getOrders
} from '../utils/storage';

const SalesAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [salesData, setSalesData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);

  useEffect(() => {
    updateAnalytics();
  }, [selectedPeriod, customStartDate, customEndDate]);

  const getDateRange = (): DateRange | undefined => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedPeriod) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return {
          start: weekStart,
          end: now
        };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        return {
          start: monthStart,
          end: now
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate + 'T23:59:59')
          };
        }
        break;
    }
    return undefined;
  };

  const updateAnalytics = () => {
    const dateRange = getDateRange();
    const sales = getSalesAnalytics(dateRange);
    const profit = getProfitAnalysis(dateRange);
    
    setSalesData(sales);
    setProfitData(profit);
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return '今日';
      case 'week': return '近7天';
      case 'month': return '近30天';
      case 'custom': return '自定义期间';
      default: return '';
    }
  };

  if (!salesData || !profitData) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>时间范围选择</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label htmlFor="period">分析周期</Label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今日</SelectItem>
                  <SelectItem value="week">近7天</SelectItem>
                  <SelectItem value="month">近30天</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 关键指标概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总营业额</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(salesData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel()}收入
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单数量</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {salesData.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel()}订单
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客单价</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(salesData.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              平均每单金额
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">净利润</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(profitData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              净利润率: {formatPercentage(profitData.netMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 利润分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>利润分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>总收入</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(profitData.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>总成本</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(profitData.totalCosts)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>额外收入</span>
                <span className="font-medium text-blue-600">
                  +{formatCurrency(profitData.totalExtraIncome)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-medium">毛利润</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(profitData.grossProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">净利润</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(profitData.netProfit)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>毛利率</span>
                <Badge variant={profitData.grossMargin >= 50 ? "default" : "secondary"}>
                  {formatPercentage(profitData.grossMargin)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>净利率</span>
                <Badge variant={profitData.netMargin >= 30 ? "default" : "secondary"}>
                  {formatPercentage(profitData.netMargin)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>成本分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profitData.breakdownByCosts.length > 0 ? (
                profitData.breakdownByCosts.map((cost: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cost.category}</span>
                      <span className="font-medium">
                        {formatCurrency(cost.amount)} ({formatPercentage(cost.percentage)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(cost.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">暂无成本数据</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 热销商品 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileBarChart className="h-5 w-5" />
            <span>热销商品排行</span>
          </CardTitle>
          <CardDescription>
            按销量排序的前5名商品
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.topSellingDrinks.length > 0 ? (
              salesData.topSellingDrinks.map((drink: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{drink.drinkName}</h4>
                      <p className="text-sm text-gray-600">销量: {drink.quantity} 杯</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(drink.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">收入</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">暂无销售数据</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 每日销售趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>每日销售趋势</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesData.dailySales.length > 0 ? (
              salesData.dailySales.slice(-10).map((day: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">
                    {new Date(day.date).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">
                      {day.orders} 单
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">暂无每日销售数据</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
