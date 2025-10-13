import './App.css';
import LoginForm from './login/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersPage from './pages/warehouseAdmin/orders/OrdersPage'
import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories'
import  RegisterForm  from "./register/RegisterForm";


import StaffCalendar from './StaffCalendar';
import VetCalendar from './vet/VetCalendar'; 


import AnimalAdminPage from './animalAdmin/AnimalAdminPage';
import UserDashboard from './user/UserDashboard';
import AddPetPage from './addPet/AddPetPage';
import PetDetails from './petDetails/PetDetails';

import PriceAdminPage from './priceAdmin/PriceAdminPage';
import PriceListPage from './priceList/PriceListPage';
import ScheduleAppointmentPage from './appointment/ScheduleAppointmentPage';

import ItemsPage from './pages/warehouseAdmin/catalog/itemsPage/ItemsPage';
import ProductDetails from './pages/warehouseAdmin/productDetailsTable/ProductDetails';
import OrderListPage from './pages/warehouseAdmin/orders/OrderListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />


        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/catalog" element={<CatalogPage />} >

            <Route index element={<CatalogCategories />} />

                <Route path=":subcategorySlug/:categoryId" element={<ItemsPage />} />
                <Route path="/catalog/:subcategorySlug/:categoryId/items/:itemId" element={<ProductDetails />}
/>

        </Route>

        <Route path="/animal-admin" element={<AnimalAdminPage />} />
        <Route path="/user" element={<UserDashboard />} />

        <Route path="/add-pet" element={<AddPetPage />} />
        <Route path="/pet-details/:petId" element={<PetDetails />} />

        <Route path="/price-list" element={<PriceListPage />} />
        <Route path="/schedule-appointment" element={<ScheduleAppointmentPage />} />
        



        <Route path="/priceAdmin" element={<PriceAdminPage />} />


     
        <Route path="/staff-calendar" element={<StaffCalendar />} />
        <Route path="/vet" element={<VetCalendar />} />

      </Routes>
    </Router>
  )
}

export default App;
