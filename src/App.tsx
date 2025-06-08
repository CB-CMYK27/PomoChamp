import React from 'react';
import AppRouter from './router';
import QuickBattle from './components/QuickBattle'
export default function App() {
  return <AppRouter />;
}
<Route path="/quick-battle" element={<QuickBattle />} />