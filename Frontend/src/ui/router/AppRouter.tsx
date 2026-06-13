import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Login from "../pages/Login/Login";
import GoogleCallback from "../pages/Login/GoogleCallback";
import Dashboard from "../pages/Dashboard/Dashboard";
import Register from "../pages/Register/Register";
import DeliveryRegister from "../pages/DeliveryRegister/DeliveryRegister";
import RegisterSelect from "../pages/RegisterSelect/RegisterSelect";
import VendorRegister from "../pages/VendorRegister/VendorRegister";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/layout/Layout/Layout";
import VendorDashboard from "../pages/VendorDashboard/VendorDashboard";
import VendorOrders from "../pages/VendorDashboard/VendorOrders";
import VendorMenu from "../pages/VendorDashboard/VendorMenu";
import VendorReviews from "../pages/VendorDashboard/VendorReviews";
import VendorCouriers from "../pages/VendorDashboard/VendorCouriers";
import VendorReports from "../pages/VendorDashboard/VendorReports";
import VendorSettings from "../pages/VendorDashboard/VendorSettings";
import VendorCatalog from "../pages/VendorDashboard/VendorCatalog";
import VendorCategories from "../pages/VendorDashboard/VendorCategories";
import VendorCourierRequests from "../pages/VendorDashboard/VendorCourierRequests";
import CourierDashboard from "../pages/CourierDashboard/CourierDashboard";
import CourierProfile from "../pages/CourierDashboard/CourierProfile";
import CourierDeliveries from "../pages/CourierDashboard/CourierDeliveries";
import CourierAvailableOrders from "../pages/CourierDashboard/CourierAvailableOrders";
import CourierEarnings from "../pages/CourierDashboard/CourierEarnings";
import Profile from "../pages/Profile/Profile";
import MyOrders from "../pages/MyOrders/MyOrders";
import PaymentHistory from "../pages/PaymentHistory/PaymentHistory";
import Stores from "../pages/Stores/Stores";
import StoreDetail from "../pages/StoreDetail/StoreDetail";
import AllProducts from "../pages/AllProducts/AllProducts";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import PaymentPage from "../pages/Payment/PaymentPage";
import OrderTracking from "../pages/Tracking/OrderTracking";
import CourierBroadcast from "../pages/Tracking/CourierBroadcast";
import AdminReports from "../pages/AdminDashboard/AdminReports";

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  if (user.role === "Negocio") return <Navigate to="/vendor/dashboard" replace />;
  if (user.role === "Domiciliario") return <Navigate to="/courier/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-delivery" element={<DeliveryRegister />} />
        <Route path="/register-select" element={<RegisterSelect />} />
        <Route path="/register-vendor" element={<VendorRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <Layout>
              <Stores />
            </Layout>
          }
        />
        <Route
          path="/store/:storeId"
          element={
            <Layout>
              <StoreDetail />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <AllProducts />
            </Layout>
          }
        />

        {/* Rutas para Vendor (Restaurante) */}
        <Route
          path="/vendor/dashboard"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/pedidos"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/menu"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/menu/catalogo"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorCatalog />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/menu/categorias"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorCategories />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/resenas"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorReviews />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/domiciliarios"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorCouriers />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/reportes"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/configuracion"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard/solicitudes"
          element={
            <PrivateRoute allowedRoles={[4]}>
              <VendorCourierRequests />
            </PrivateRoute>
          }
        />

        {/* Rutas para Domiciliario */}
        <Route
          path="/courier/dashboard"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <Layout>
                <MyOrders />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <Layout>
                <PaymentHistory />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/courier/profile"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/courier/available"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierAvailableOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/courier/deliveries"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierDeliveries />
            </PrivateRoute>
          }
        />
        <Route
          path="/courier/earnings"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierEarnings />
            </PrivateRoute>
          }
        />
        {/* Domiciliario transmite su GPS durante la entrega */}
        <Route
          path="/courier/tracking/:orderId"
          element={
            <PrivateRoute allowedRoles={[3]}>
              <CourierBroadcast />
            </PrivateRoute>
          }
        />

        {/* Panel de administración — reportes */}
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminReports />
            </PrivateRoute>
          }
        />

        {/* Checkout (solo usuario) */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <Layout>
                <CheckoutPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Pago / factura (cualquier autenticado) */}
        <Route
          path="/payment/:orderId"
          element={
            <PrivateRoute>
              <Layout>
                <PaymentPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Seguimiento en vivo del pedido (usuario/negocio/admin autenticado) */}
        <Route
          path="/tracking/:orderId"
          element={
            <PrivateRoute>
              <Layout>
                <OrderTracking />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
