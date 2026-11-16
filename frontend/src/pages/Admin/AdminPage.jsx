import { Navigate, Route, Routes } from 'react-router-dom';
import AdminGuard from './AdminGuard';
import AdminLogin from './AdminLogin';
import DashboardPage from './DashboardPage';
import OrdersAdminPage from './OrdersAdminPage';
import CustomizationsAdminPage from './CustomizationsAdminPage';
import ProductsAdminPage from './ProductsAdminPage';
import CategoriesAdminPage from './CategoriesAdminPage';
import CustomersAdminPage from './CustomersAdminPage';
import DeliveryZonesAdminPage from './DeliveryZonesAdminPage';
import SettingsAdminPage from './SettingsAdminPage';

export default function AdminPage() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersAdminPage />} />
        <Route path="customizations" element={<CustomizationsAdminPage />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="categories" element={<CategoriesAdminPage />} />
        <Route path="customers" element={<CustomersAdminPage />} />
        <Route path="delivery-zones" element={<DeliveryZonesAdminPage />} />
        <Route path="settings" element={<SettingsAdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
