import { Drink, Order, Cost, ExtraIncome, SalesAnalytics, ProfitAnalysis, DateRange } from '../types';
import { defaultDrinks } from '../data/defaultMenu';
import { supabaseApi, syncAllData, getSyncStatus, updateSyncStatus, SyncStatus } from './supabase';

const STORAGE_KEYS = {
  DRINKS: 'drink_shop_drinks',
  ORDERS: 'drink_shop_orders',
  ORDER_COUNTER: 'drink_shop_order_counter',
  COSTS: 'drink_shop_costs',
  EXTRA_INCOMES: 'drink_shop_extra_incomes'
};

// 获取饮料菜单
export const getDrinks = (): Drink[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DRINKS);
  if (!stored) {
    saveDrinks(defaultDrinks);
    return defaultDrinks;
  }
  return JSON.parse(stored);
};

// 保存饮料菜单
export const saveDrinks = (drinks: Drink[]): void => {
  localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
  
  // 自动同步到云端 - 明确指定字段避免循环引用
  const cleanDrinks = drinks.map(drink => ({
    id: drink.id,
    name: drink.name,
    price: drink.price,
    image: drink.image,
    category: drink.category,
    available: drink.available
  }));
  
  autoSyncToCloud('upsert_drinks', cleanDrinks).catch(console.warn);
};

// 获取所有订单
export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!stored) return [];
  return JSON.parse(stored).map((order: any) => ({
    ...order,
    timestamp: new Date(order.timestamp)
  }));
};

// 保存订单
export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  
  // 准备同步数据 - 明确指定字段，避免循环引用
  const orderItems = order.items.map(item => ({
    id: item.id,
    order_id: order.id,
    drink_id: item.drinkId,
    drink_name: item.drinkName,
    price: item.price,
    quantity: item.quantity,
    sugar: item.sugar,
    ice: item.ice,
    subtotal: item.subtotal
  }));
  
  // 自动同步到云端 - 分别处理订单和订单项
  autoSyncToCloud('save_order', { 
    order: {
      id: order.id,
      total: order.total,
      status: order.status,
      timestamp: order.timestamp.toISOString(), // 确保时间格式正确
      order_number: order.orderNumber
    },
    orderItems 
  }).catch(console.warn);
};

// 更新订单状态
export const updateOrderStatus = (orderId: string, status: '待处理' | '已完成'): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    // 自动同步到云端
    autoSyncToCloud('update_order_status', { 
      orderId, 
      status 
    }).catch(console.warn);
  }
};

// 获取下一个订单号
export const getNextOrderNumber = (): string => {
  const counter = localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER);
  const nextNumber = counter ? parseInt(counter) + 1 : 1;
  localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, nextNumber.toString());
  return nextNumber.toString().padStart(3, '0');
};

// 删除订单
export const deleteOrder = (orderId: string): void => {
  const orders = getOrders();
  const filteredOrders = orders.filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders));
  
  // 自动同步到云端
  autoSyncToCloud('delete_order', { 
    orderId 
  }).catch(console.warn);
};

// 清空所有订单
export const clearAllOrders = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.ORDER_COUNTER);
};

// 导出订单数据为CSV
export const exportOrdersToCSV = (): string => {
  const orders = getOrders();
  const headers = ['订单号', '时间', '商品', '糖度', '冰块', '数量', '小计', '总计', '状态'];
  
  const rows = orders.flatMap(order => 
    order.items.map((item, index) => [
      index === 0 ? order.orderNumber : '',
      index === 0 ? order.timestamp.toLocaleString('zh-CN') : '',
      item.drinkName,
      item.sugar,
      item.ice,
      item.quantity.toString(),
      item.subtotal.toString(),
      index === 0 ? order.total.toString() : '',
      index === 0 ? order.status : ''
    ])
  );
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// ===============================================
// 成本管理相关函数
// ===============================================
export const getCosts = (): Cost[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.COSTS);
  if (!stored) return [];
  return JSON.parse(stored);
};

export const saveCost = (cost: Cost): void => {
  const costs = getCosts();
  costs.push(cost);
  localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs));
  
  // 自动同步到云端
  autoSyncToCloud('save_cost', cost).catch(console.warn);
};

export const updateCost = (costId: string, updatedCost: Partial<Cost>): void => {
  const costs = getCosts();
  const costIndex = costs.findIndex(c => c.id === costId);
  if (costIndex !== -1) {
    costs[costIndex] = { ...costs[costIndex], ...updatedCost };
    localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs));
    
    // 自动同步到云端
    autoSyncToCloud('save_cost', costs[costIndex]).catch(console.warn);
  }
};

export const deleteCost = (costId: string): void => {
  const costs = getCosts();
  const filteredCosts = costs.filter(c => c.id !== costId);
  localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(filteredCosts));
  
  // 自动同步到云端
  autoSyncToCloud('delete_cost', { costId }).catch(console.warn);
};

// ===============================================
// 额外收入管理相关函数
// ===============================================
export const getExtraIncomes = (): ExtraIncome[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXTRA_INCOMES);
  if (!stored) return [];
  return JSON.parse(stored);
};

export const saveExtraIncome = (income: ExtraIncome): void => {
  const incomes = getExtraIncomes();
  incomes.push(income);
  localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(incomes));
  
  // 自动同步到云端
  autoSyncToCloud('save_extra_income', income).catch(console.warn);
};

export const updateExtraIncome = (incomeId: string, updatedIncome: Partial<ExtraIncome>): void => {
  const incomes = getExtraIncomes();
  const incomeIndex = incomes.findIndex(i => i.id === incomeId);
  if (incomeIndex !== -1) {
    incomes[incomeIndex] = { ...incomes[incomeIndex], ...updatedIncome };
    localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(incomes));
    
    // 自动同步到云端
    autoSyncToCloud('save_extra_income', incomes[incomeIndex]).catch(console.warn);
  }
};

export const deleteExtraIncome = (incomeId: string): void => {
  const incomes = getExtraIncomes();
  const filteredIncomes = incomes.filter(i => i.id !== incomeId);
  localStorage.setItem(STORAGE_KEYS.EXTRA_INCOMES, JSON.stringify(filteredIncomes));
  
  // 自动同步到云端
  autoSyncToCloud('delete_extra_income', { incomeId }).catch(console.warn);
};

// ===============================================
// 销售分析相关函数
// ===============================================
export const getSalesAnalytics = (dateRange?: DateRange): SalesAnalytics => {
  const orders = getOrders();
  let filteredOrders = orders;

  // 如果提供了日期范围，进行过滤
  if (dateRange) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }

  // 计算总收入和订单数
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 计算热销商品
  const drinkStats = new Map<string, { quantity: number; revenue: number }>();
  
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = drinkStats.get(item.drinkName) || { quantity: 0, revenue: 0 };
      drinkStats.set(item.drinkName, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotal
      });
    });
  });

  const topSellingDrinks = Array.from(drinkStats.entries())
    .map(([drinkName, stats]) => ({ drinkName, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // 计算每日销售额
  const dailySalesMap = new Map<string, { revenue: number; orders: number }>();
  
  filteredOrders.forEach(order => {
    const dateKey = order.timestamp.toISOString().split('T')[0];
    const existing = dailySalesMap.get(dateKey) || { revenue: 0, orders: 0 };
    dailySalesMap.set(dateKey, {
      revenue: existing.revenue + order.total,
      orders: existing.orders + 1
    });
  });

  const dailySales = Array.from(dailySalesMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 计算月度销售额
  const monthlySalesMap = new Map<string, { revenue: number; orders: number }>();
  
  filteredOrders.forEach(order => {
    const monthKey = order.timestamp.toISOString().substring(0, 7); // YYYY-MM
    const existing = monthlySalesMap.get(monthKey) || { revenue: 0, orders: 0 };
    monthlySalesMap.set(monthKey, {
      revenue: existing.revenue + order.total,
      orders: existing.orders + 1
    });
  });

  const monthlySales = Array.from(monthlySalesMap.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topSellingDrinks,
    dailySales,
    monthlySales
  };
};

// ===============================================
// 利润分析相关函数
// ===============================================
export const getProfitAnalysis = (dateRange?: DateRange): ProfitAnalysis => {
  const orders = getOrders();
  const costs = getCosts();
  const extraIncomes = getExtraIncomes();

  let filteredOrders = orders;
  let filteredCosts = costs;
  let filteredExtraIncomes = extraIncomes;

  // 如果提供了日期范围，进行过滤
  if (dateRange) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
    
    filteredCosts = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= dateRange.start && costDate <= dateRange.end;
    });
    
    filteredExtraIncomes = extraIncomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= dateRange.start && incomeDate <= dateRange.end;
    });
  }

  // 计算收入
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalExtraIncome = filteredExtraIncomes.reduce((sum, income) => sum + income.amount, 0);

  // 计算成本
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);

  // 计算利润
  const grossProfit = totalRevenue - totalCosts;
  const netProfit = grossProfit + totalExtraIncome;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // 成本分类分析
  const costsByCategory = new Map<string, number>();
  filteredCosts.forEach(cost => {
    const existing = costsByCategory.get(cost.category) || 0;
    costsByCategory.set(cost.category, existing + cost.amount);
  });

  const breakdownByCosts = Array.from(costsByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalCosts > 0 ? (amount / totalCosts) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalRevenue,
    totalCosts,
    totalExtraIncome,
    grossProfit,
    netProfit,
    grossMargin,
    netMargin,
    breakdownByCosts
  };
};

// ===============================================
// Supabase云端数据同步管理
// ===============================================

// 获取同步状态
export const getCloudSyncStatus = (): SyncStatus => {
  return getSyncStatus();
};

// 获取所有本地数据用于同步
export const getAllLocalData = () => {
  return {
    orders: getOrders(),
    drinks: getDrinks(),
    costs: getCosts(),
    extraIncomes: getExtraIncomes()
  };
};

// 完整数据同步到云端（替换原Google Sheets功能）
export const syncToCloud = async (): Promise<{ success: boolean; message: string; result?: any }> => {
  return await syncAllData();
};

// 自动同步单个数据项到云端
const autoSyncToCloud = async (operation: string, data: any) => {
  // 只在网络可用时尝试同步
  if (!navigator.onLine) {
    console.log(`离线状态: ${operation} 数据已保存到本地，将在网络恢复后同步`);
    return;
  }

  try {
    switch (operation) {
      case 'upsert_drink':
        await supabaseApi.upsertDrinks([data]);
        break;
      case 'upsert_drinks':
        await supabaseApi.upsertDrinks(data);
        break;
      case 'save_order':
        await supabaseApi.upsertOrder(data.order);
        if (data.orderItems && data.orderItems.length > 0) {
          await supabaseApi.upsertOrderItems(data.orderItems);
        }
        break;
      case 'update_order_status':
        await supabaseApi.updateOrderStatus(data.orderId, data.status);
        break;
      case 'delete_order':
        await supabaseApi.deleteOrder(data.orderId);
        break;
      case 'save_cost':
        await supabaseApi.upsertCost(data);
        break;
      case 'delete_cost':
        await supabaseApi.deleteCost(data.costId);
        break;
      case 'save_extra_income':
        await supabaseApi.upsertExtraIncome(data);
        break;
      case 'delete_extra_income':
        await supabaseApi.deleteExtraIncome(data.incomeId);
        break;
    }
    
    // 更新同步状态
    updateSyncStatus({ 
      lastSync: new Date().toISOString(),
      error: null 
    });
  } catch (error) {
    console.warn(`自动同步失败 (${operation}):`, error);
    updateSyncStatus({ 
      error: error instanceof Error ? error.message : '同步失败' 
    });
  }
};
