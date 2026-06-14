import { useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import RecentOrders from "../../components/vendor/RecentOrders";
import MenuPerformance from "../../components/vendor/MenuPerformance";
import VendorCourierMap from "../../components/vendor/VendorCourierMap";
import DashboardStats from "../../components/vendor/DashboardStats";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const { fetchMyProfile, vendorProfile } = useAuth();

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
          <VendorCourierMap
            vendorLat={vendorProfile?.latitude}
            vendorLng={vendorProfile?.longitude}
            vendorName={vendorProfile?.business_name}
            vendorAddress={vendorProfile?.address}
            vendorLogo={vendorProfile?.logo_url}
          />
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;