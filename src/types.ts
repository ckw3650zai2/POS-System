// 饮料类型定义
export interface Drink {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

// 订单项类型定义
export interface OrderItem {
  id: string;
  drinkId: string;
  drinkName: string;
  price: number;
  quantity: number;
  sugar: '无糖' | '少糖' | '半糖' | '正常';
  ice: '去冰' | '少冰' | '正常冰';
  subtotal: number;
}

// 订单类型定义
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: '待处理' | '已完成';
  timestamp: Date;
  orderNumber: string;
}

// 当前订单状态类型
export interface CurrentOrder {
  items: OrderItem[];
  total: number;
}

// 成本记录类型定义
export interface Cost {
  id: string;
  name: string;
  amount: number;
  category: '原料成本' | '人工成本' | '租金成本' | '设备成本' | '其他成本';
  date: string;
  description?: string;
  createdAt: string;
}

// 额外收入类型定义
export interface ExtraIncome {
  id: string;
  name: string;
  amount: number;
  category: '服务费' | '配送费' | '其他收入';
  date: string;
  description?: string;
  createdAt: string;
}

// 销售分析数据类型
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingDrinks: Array<{
    drinkName: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// 利润分析数据类型
export interface ProfitAnalysis {
  totalRevenue: number;
  totalCosts: number;
  totalExtraIncome: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  breakdownByCosts: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// 日期范围类型
export interface DateRange {
  start: Date;
  end: Date;
}