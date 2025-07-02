import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import OrderPage from './pages/OrderPage';
import ManagementPage from './pages/ManagementPage';
import Navigation from './components/Navigation';

function App() {
  const [currentView, setCurrentView] = useState<'order' | 'management'>('order');

  return (
    <AppProvider>
      <div className="relative">
        {currentView === 'order' && <OrderPage />}
        {currentView === 'management' && <ManagementPage />}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </AppProvider>
  );
}

export default App;
