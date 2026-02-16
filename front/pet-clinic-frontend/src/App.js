import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginForm from './login/LoginForm';
import RegisterForm from './register/RegisterForm';

import NotificationsPage from './pages/warehouseAdmin/notifications/NotificationsPage';
import CatalogPage from './pages/warehouseAdmin/catalog/CatalogPage';
import CatalogCategories from './pages/warehouseAdmin/catalog/catalogCategories/CatalogCategories';
import ItemsPage from './pages/warehouseAdmin/catalog/itemsPage/ItemsPage';
import ProductDetails from './pages/warehouseAdmin/productDetailsTable/ProductDetails';
import OrderListPage from './pages/warehouseAdmin/orders/OrderListPage';

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
import AnalyticsPage from './analytics/AnalyticsPage';
import ManagerDashboard from './manager/ManagerDashboard';
import MedicamentsPage from './medicaments/MedicamentsPage';
import PricingPage from './pricing/PricingPage';
import StaffPage from './staff/StaffPage';
import WaitlistPage from './waitlist/WaitlistPage';
import VetCalendarPage from './pages/VetCalendarPage';
import StaffCalendarsPage from './staff/StaffCalendarsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Veterinar – kalendar (:veterinarianId je opcioni parametar) */}
        <Route path="/vet-calendar/:veterinarianId?" element={<VetCalendarPage />} />
        {/* Ako se negde još koristi stari URL, samo redirect na kalendar */}
        <Route path="/vet/dashboard" element={<Navigate to="/vet-calendar" replace />} />

        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/staff-calendars" element={<StaffCalendarsPage />} />

        <Route path="/catalog" element={<CatalogPage />}>
          <Route index element={<CatalogCategories />} />
          <Route path=":subcategorySlug/:categoryId" element={<ItemsPage />} />
          {/* CHILD ruta mora biti relativna */}
          <Route path=":subcategorySlug/:categoryId/items/:itemId" element={<ProductDetails />} />
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
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/medicaments" element={<MedicamentsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/staff" element={<StaffPage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />

        <Route path="/priceAdmin" element={<PriceAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
