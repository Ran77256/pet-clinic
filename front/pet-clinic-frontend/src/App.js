import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginForm from './login/LoginForm';
import RegisterForm from './register/RegisterForm';

import OrdersPage from './pages/warehouseAdmin/orders/OrdersPage';
import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories';
import MedicamentsPage from './pages/warehouseAdmin/catalog/medicamentsPage/MedicamentsPage';

import PriceAdminPage from './priceAdmin/PriceAdminPage';
import AnimalAdminPage from './animalAdmin/AnimalAdminPage';
import UserDashboard from './user/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* auth */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* warehouse admin */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/catalog" element={<CatalogPage />}>
          <Route index element={<CatalogCategories />} />
          <Route path="medicaments" element={<MedicamentsPage />} />
          <Route path="food" element={<h2>Hrana Placeholder</h2>} />
          <Route path="equipment" element={<h2>Oprema Placeholder</h2>} />
        </Route>

        {/* price admin */}
        <Route path="/price-admin" element={<PriceAdminPage />} />

        {/* animal admin */}
        <Route path="/animal-admin" element={<AnimalAdminPage />} />

        {/* user */}
        <Route path="/user" element={<UserDashboard />} />

        {/* 404 fallback (optional) */}
        <Route path="*" element={<h2 style={{ padding: 16 }}>404 – Page not found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
