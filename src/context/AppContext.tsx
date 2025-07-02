import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Drink, Order, CurrentOrder, OrderItem } from '../types';
import { getDrinks, getOrders, saveOrder, updateOrderStatus, deleteOrder, getNextOrderNumber, saveDrinks } from '../utils/storage';
import { initAutoSync } from '../utils/supabase';

interface AppState {
  drinks: Drink[];
  orders: Order[];
  currentOrder: CurrentOrder;
}

type AppAction = 
  | { type: 'SET_DRINKS'; payload: Drink[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER_ITEM'; payload: OrderItem }
  | { type: 'UPDATE_ORDER_ITEM'; payload: { id: string; updates: Partial<OrderItem> } }
  | { type: 'REMOVE_ORDER_ITEM'; payload: string }
  | { type: 'CLEAR_CURRENT_ORDER' }
  | { type: 'SUBMIT_ORDER' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: '待处理' | '已完成' } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_DRINK'; payload: Drink }
  | { type: 'UPDATE_DRINK'; payload: Drink }
  | { type: 'DELETE_DRINK'; payload: string };

const initialState: AppState = {
  drinks: [],
  orders: [],
  currentOrder: { items: [], total: 0 }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_DRINKS':
      return { ...state, drinks: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER_ITEM': {
      const existingItemIndex = state.currentOrder.items.findIndex(
        item => item.drinkId === action.payload.drinkId && 
                 item.sugar === action.payload.sugar && 
                 item.ice === action.payload.ice
      );
      
      let newItems;
      if (existingItemIndex !== -1) {
        newItems = [...state.currentOrder.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
        newItems[existingItemIndex].subtotal = newItems[existingItemIndex].quantity * newItems[existingItemIndex].price;
      } else {
        newItems = [...state.currentOrder.items, action.payload];
      }
      
      const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      return {
        ...state,
        currentOrder: { items: newItems, total }
      };
    }
    case 'UPDATE_ORDER_ITEM': {
      const newItems = state.currentOrder.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates, subtotal: (action.payload.updates.quantity || item.quantity) * item.price }
          : item
      );
      const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      return {
        ...state,
        currentOrder: { items: newItems, total }
      };
    }
    case 'REMOVE_ORDER_ITEM': {
      const newItems = state.currentOrder.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      return {
        ...state,
        currentOrder: { items: newItems, total }
      };
    }
    case 'CLEAR_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: { items: [], total: 0 }
      };
    case 'SUBMIT_ORDER': {
      const orderNumber = getNextOrderNumber();
      const newOrder: Order = {
        id: Date.now().toString(),
        items: state.currentOrder.items,
        total: state.currentOrder.total,
        status: '待处理',
        timestamp: new Date(),
        orderNumber
      };
      saveOrder(newOrder);
      return {
        ...state,
        orders: [newOrder, ...state.orders],
        currentOrder: { items: [], total: 0 }
      };
    }
    case 'UPDATE_ORDER_STATUS': {
      updateOrderStatus(action.payload.orderId, action.payload.status);
      const newOrders = state.orders.map(order =>
        order.id === action.payload.orderId
          ? { ...order, status: action.payload.status }
          : order
      );
      return { ...state, orders: newOrders };
    }
    case 'DELETE_ORDER': {
      deleteOrder(action.payload);
      const newOrders = state.orders.filter(order => order.id !== action.payload);
      return { ...state, orders: newOrders };
    }
    case 'ADD_DRINK': {
      const newDrinks = [...state.drinks, action.payload];
      saveDrinks(newDrinks);
      return { ...state, drinks: newDrinks };
    }
    case 'UPDATE_DRINK': {
      const newDrinks = state.drinks.map(drink =>
        drink.id === action.payload.id ? action.payload : drink
      );
      saveDrinks(newDrinks);
      return { ...state, drinks: newDrinks };
    }
    case 'DELETE_DRINK': {
      const newDrinks = state.drinks.filter(drink => drink.id !== action.payload);
      saveDrinks(newDrinks);
      return { ...state, drinks: newDrinks };
    }
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // 初始化数据
    dispatch({ type: 'SET_DRINKS', payload: getDrinks() });
    dispatch({ type: 'SET_ORDERS', payload: getOrders() });
    
    // 初始化Supabase自动同步
    initAutoSync();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
