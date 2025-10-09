import './App.css';
import LoginForm from './login/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersPage from './pages/warehouseAdmin/orders/OrdersPage'
import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import MedicamentsPage from './pages/warehouseAdmin/catalog/medicamentsPage/MedicamentsPage'
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories'
import  RegisterForm  from "./register/RegisterForm";

import AnimalAdminPage from './animalAdmin/AnimalAdminPage';
import UserDashboard from './user/UserDashboard';
import AddPetPage from './addPet/AddPetPage';

import PriceAdminPage from './priceAdmin/PriceAdminPage';


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

            <Route path="medicaments" element={<MedicamentsPage />} />
            
            <Route path="food" element={<h2>Hrana Placehoder</h2>} />
            
            <Route path="equipment" element={<h2>Oprema Placehoder</h2>} />
            
        </Route>
        
        <Route path="/animal-admin" element={<AnimalAdminPage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/add-pet" element={<AddPetPage />} />
        

    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/catalog" element={<CatalogPage />} >
      <Route index element={<CatalogCategories />} /> 
      <Route path="medicaments" element={<MedicamentsPage />} />
      <Route path="food" element={<h2>Hrana Placehoder</h2>} />
      <Route path="equipment" element={<h2>Oprema Placehoder</h2>} />
    </Route>
    <Route path="/priceAdmin" element={<PriceAdminPage />} />

      </Routes>
    </Router>
  )
}

export default App;
