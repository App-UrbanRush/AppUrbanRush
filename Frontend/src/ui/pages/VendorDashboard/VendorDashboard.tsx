import { useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import DashboardStats from "../../components/vendor/DashboardStats";
import RecentOrders from "../../components/vendor/RecentOrders";
import MenuPerformance from "../../components/vendor/MenuPerformance";
import VendorCourierMap from "../../components/vendor/VendorCourierMap";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const { fetchMyProfile } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      await fetchMyProfile();
    };

    loadProfile();
  }, [fetchMyProfile]);

  return (
    <VendorLayout>
      <div className="vendor-dashboard">
        <DashboardStats />
        <RecentOrders />
        <div className="vendor-dashboard-row">
          <MenuPerformance />
          <VendorCourierMap />
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;