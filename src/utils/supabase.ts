import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://yotvfsqmnbvzdgmoyyvn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdHZmc3FtbmJ2emRnbW95eXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTE0NjAsImV4cCI6MjA2NzAyNzQ2MH0.Ah70tmw4Mu3V35_nDwUenhPjliWDplt2W68Z1vV6Pu4'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据同步状态管理
export interface SyncStatus {
  isOnline: boolean
  lastSync: string | null
  syncing: boolean
  error: string | null
}

// 初始化同步状态
let syncStatus: SyncStatus = {
  isOnline: navigator.onLine,
  lastSync: localStorage.getItem('last_sync_time'),
  syncing: false,
  error: null
}

// 监听网络状态变化
window.addEventListener('online', () => {
  syncStatus.isOnline = true
  // 网络恢复时自动同步
  setTimeout(() => syncAllData(), 1000)
})

window.addEventListener('offline', () => {
  syncStatus.isOnline = false
})

// 获取同步状态
export const getSyncStatus = (): SyncStatus => ({ ...syncStatus })

// 更新同步状态
export const updateSyncStatus = (updates: Partial<SyncStatus>) => {
  syncStatus = { ...syncStatus, ...updates }
  if (updates.lastSync) {
    localStorage.setItem('last_sync_time', updates.lastSync)
  }
}

// Supabase API 操作
export const supabaseApi = {
  // 饮料相关
  async getDrinks() {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async upsertDrinks(drinks: any[]) {
    const { error } = await supabase
      .from('drinks')
      .upsert(drinks.map(drink => ({
        ...drink,
        updated_at: new Date().toISOString()
      })))
    
    if (error) throw error
  },

  // 订单相关
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async upsertOrder(order: any) {
    // 移除items字段，因为订单项是单独存储的
    const { items, ...orderData } = order
    const { error } = await supabase
      .from('orders')
      .upsert({
        ...orderData,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    if (error) throw error
  },

  async deleteOrder(orderId: string) {
    // 先删除订单项
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)
    
    // 再删除订单
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
    
    if (error) throw error
  },

  // 订单项相关
  async getOrderItems() {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async upsertOrderItems(items: any[]) {
    const { error } = await supabase
      .from('order_items')
      .upsert(items)
    
    if (error) throw error
  },

  // 成本相关
  async getCosts() {
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async upsertCost(cost: any) {
    const { error } = await supabase
      .from('costs')
      .upsert({
        ...cost,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  },

  async deleteCost(costId: string) {
    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('id', costId)
    
    if (error) throw error
  },

  // 额外收入相关
  async getExtraIncomes() {
    const { data, error } = await supabase
      .from('extra_incomes')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async upsertExtraIncome(income: any) {
    const { error } = await supabase
      .from('extra_incomes')
      .upsert({
        ...income,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  },

  async deleteExtraIncome(incomeId: string) {
    const { error } = await supabase
      .from('extra_incomes')
      .delete()
      .eq('id', incomeId)
    
    if (error) throw error
  }
}

// 深拷贝函数，避免循环引用
const deepClone = (obj: any, seen = new WeakSet()): any => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  
  // 检查循环引用
  if (seen.has(obj)) {
    return {}; // 返回空对象代替循环引用
  }
  seen.add(obj)
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item, seen))
  }
  
  const cloned: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], seen)
    }
  }
  return cloned
}

// 全量数据同步函数
export const syncAllData = async (): Promise<{ success: boolean; message: string }> => {
  if (!syncStatus.isOnline) {
    return { success: false, message: '网络连接不可用' }
  }

  try {
    updateSyncStatus({ syncing: true, error: null })
    
    // 获取本地数据并进行深拷贝
    const localDrinks = deepClone(JSON.parse(localStorage.getItem('drink_shop_drinks') || '[]'))
    const localOrders = deepClone(JSON.parse(localStorage.getItem('drink_shop_orders') || '[]'))
    const localCosts = deepClone(JSON.parse(localStorage.getItem('drink_shop_costs') || '[]'))
    const localExtraIncomes = deepClone(JSON.parse(localStorage.getItem('drink_shop_extra_incomes') || '[]'))
    
    // 同步到云端
    if (localDrinks.length > 0) {
      await supabaseApi.upsertDrinks(localDrinks)
    }
    
    if (localOrders.length > 0) {
      // 同步订单（不包含items字段）
      for (const order of localOrders) {
        const orderData = {
          id: order.id,
          total: order.total,
          status: order.status,
          timestamp: typeof order.timestamp === 'string' ? order.timestamp : order.timestamp.toISOString(),
          order_number: order.orderNumber
        }
        await supabaseApi.upsertOrder(orderData)
      }
      
      // 同步订单项
      const allOrderItems = localOrders.flatMap(order => 
        order.items.map((item: any) => ({
          id: item.id,
          order_id: order.id,
          drink_id: item.drinkId,
          drink_name: item.drinkName,
          price: item.price,
          quantity: item.quantity,
          sugar: item.sugar,
          ice: item.ice,
          subtotal: item.subtotal
        }))
      )
      
      if (allOrderItems.length > 0) {
        await supabaseApi.upsertOrderItems(allOrderItems)
      }
    }
    
    if (localCosts.length > 0) {
      for (const cost of localCosts) {
        await supabaseApi.upsertCost(cost)
      }
    }
    
    if (localExtraIncomes.length > 0) {
      for (const income of localExtraIncomes) {
        await supabaseApi.upsertExtraIncome(income)
      }
    }
    
    const now = new Date().toISOString()
    updateSyncStatus({ 
      syncing: false, 
      lastSync: now,
      error: null
    })
    
    return { success: true, message: '数据同步成功' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '同步失败'
    updateSyncStatus({ 
      syncing: false, 
      error: errorMessage
    })
    
    return { success: false, message: errorMessage }
  }
}

// 从云端拉取数据到本地
export const pullDataFromCloud = async (): Promise<{ success: boolean; message: string }> => {
  if (!syncStatus.isOnline) {
    return { success: false, message: '网络连接不可用' }
  }

  try {
    updateSyncStatus({ syncing: true, error: null })
    
    // 从云端获取数据
    const [cloudDrinks, cloudOrders, cloudOrderItems, cloudCosts, cloudExtraIncomes] = await Promise.all([
      supabaseApi.getDrinks(),
      supabaseApi.getOrders(),
      supabaseApi.getOrderItems(),
      supabaseApi.getCosts(),
      supabaseApi.getExtraIncomes()
    ])
    
    // 确保数据是干净的
    const cleanDrinks = deepClone(cloudDrinks)
    const cleanCosts = deepClone(cloudCosts)
    const cleanExtraIncomes = deepClone(cloudExtraIncomes)
    
    // 重构订单数据，将订单项合并到订单中
    const ordersWithItems = cloudOrders.map(order => {
      const orderItems = cloudOrderItems.filter(item => item.order_id === order.id)
      return {
        id: order.id,
        total: Number(order.total),
        status: order.status,
        timestamp: new Date(order.timestamp),
        orderNumber: order.order_number, // 字段名映射
        items: orderItems.map(item => ({
          id: item.id,
          drinkId: item.drink_id,
          drinkName: item.drink_name,
          price: Number(item.price),
          quantity: item.quantity,
          sugar: item.sugar,
          ice: item.ice,
          subtotal: Number(item.subtotal)
        }))
      }
    })
    
    // 更新本地存储
    localStorage.setItem('drink_shop_drinks', JSON.stringify(cloudDrinks))
    localStorage.setItem('drink_shop_orders', JSON.stringify(ordersWithItems))
    localStorage.setItem('drink_shop_costs', JSON.stringify(cloudCosts))
    localStorage.setItem('drink_shop_extra_incomes', JSON.stringify(cloudExtraIncomes))
    
    const now = new Date().toISOString()
    updateSyncStatus({ 
      syncing: false, 
      lastSync: now,
      error: null
    })
    
    return { success: true, message: '数据拉取成功' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '拉取失败'
    updateSyncStatus({ 
      syncing: false, 
      error: errorMessage
    })
    
    return { success: false, message: errorMessage }
  }
}

// 自动同步：应用启动时拉取数据，数据变更时推送到云端
export const initAutoSync = () => {
  // 检查是否已经初始化过
  if (localStorage.getItem('supabase_sync_initialized')) {
    console.log('Supabase自动同步已初始化')
    return
  }
  
  // 应用启动时拉取云端数据
  if (navigator.onLine) {
    pullDataFromCloud().catch(console.error)
  }
  
  // 定期自动同步（每5分钟）
  setInterval(() => {
    if (navigator.onLine && !syncStatus.syncing) {
      syncAllData().catch(console.error)
    }
  }, 5 * 60 * 1000)
  
  // 标记已初始化
  localStorage.setItem('supabase_sync_initialized', 'true')
  console.log('Supabase自动同步已启动')
}
