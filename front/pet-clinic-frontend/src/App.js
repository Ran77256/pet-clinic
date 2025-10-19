import './App.css';
import LoginForm from './login/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersPage from './pages/warehouseAdmin/orders/OrdersPage'
import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories'
import  RegisterForm  from "./register/RegisterForm";
import PriceAdminPage from './priceAdmin/PriceAdminPage';
import CreatePromotionPage from './promotion/CreatePromotionPage';
import EditPromotionPage from './promotion/EditPromotionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/catalog" element={<CatalogPage />} >
      <Route index element={<CatalogCategories />} /> 
      <Route path="food" element={<h2>Hrana Placehoder</h2>} />
      <Route path="equipment" element={<h2>Oprema Placehoder</h2>} />
    </Route>
  <Route path="/priceAdmin" element={<PriceAdminPage />} />
  <Route path="/add-promotion" element={<CreatePromotionPage />} />
  <Route path="/edit-promotion/:id" element={<EditPromotionPage />} />
      </Routes>
    </Router>
  )
}

export default App;
