import './App.css';
import LoginForm from './login/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersPage from './pages/warehouseAdmin/orders/OrdersPage'
import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories'
import  RegisterForm  from "./register/RegisterForm";

import AnimalAdminPage from './animalAdmin/AnimalAdminPage';
import UserDashboard from './user/UserDashboard';
import AddPetPage from './addPet/AddPetPage';
import PetDetails from './petDetails/PetDetails';
import VetPetDetails from './vetPetDetails/VetPetDetails';
import CreateMedicalReport from './medicalReport/CreateMedicalReport';

import PriceAdminPage from './priceAdmin/PriceAdminPage';
import PriceListPage from './priceList/PriceListPage';
import UserPriceList from './userPriceList/UserPriceList';
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
        <Route path="/vet-pet-details/:veterinarianId" element={<VetPetDetails />} />
        <Route path="/create-medical-report/:petId/:veterinarianId" element={<CreateMedicalReport />} />

        <Route path="/price-list" element={<PriceListPage />} />
        <Route path="/user-price-list" element={<UserPriceList />} />
        <Route path="/schedule-appointment" element={<ScheduleAppointmentPage />} />
        



        <Route path="/priceAdmin" element={<PriceAdminPage />} />

      </Routes>
    </Router>
  )
}

export default App;
