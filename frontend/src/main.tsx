import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import OrderPage from "./pages/orders/create";
import HistoryPage from "./pages/orders/history";
import StockEmpPage from "./pages/stock/employee";
import StockAdminPage from "./pages/stock/Admin";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ ห่อด้วย BrowserRouter */}
      {/* <App /> */}
      <OrderPage></OrderPage>
      <HistoryPage></HistoryPage>
      <StockEmpPage></StockEmpPage>
      <StockAdminPage></StockAdminPage>
    </BrowserRouter>
  </StrictMode>,
)
