import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { osrmService } from "../../../infrastructure/routing/osrmService";
import { Bike, Package, Navigation } from "lucide-react";
import "./CourierDeliveryMap.css";

const vendorIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#7c3aed" stroke="#fff" stroke-width="2"/>
    <path d="M3 7h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" fill="#fff"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const courierIcon = L.divIcon({
  className: "",
  html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
    <path d="M7 15a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" fill="#fff"/>
    <path d="M5 13h3l2-3h4l1 3h3" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customerIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#ef4444" stroke="#fff" stroke-width="2"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#fff"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface DeliveryRoute {
  orderId: string;
  vendorName: string;
  vendorAddress: string;
  vendorCoords: [number, number];
  customerName: string;
  customerAddress: string;
  customerCoords: [number, number];
  routeGeometry?: [number, number][];
  distance?: number;
  duration?: number;
}

interface CourierDeliveryMapProps {
  showRoute?: boolean;
  courierLat?: number | null;
  courierLng?: number | null;
  customerLat?: number | null;
  customerLng?: number | null;
  customerAddress?: string | null;
}

function isValidCoord(coord: [number, number]): boolean {
  return Array.isArray(coord) && coord.length === 2 &&
    typeof coord[0] === 'number' && !isNaN(coord[0]) &&
    typeof coord[1] === 'number' && !isNaN(coord[1]);
}

function FitBounds({ routes }: { routes: DeliveryRoute[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (routes.length === 0) return;
    
    const allPoints: [number, number][] = [];
    routes.forEach(route => {
      if (isValidCoord(route.vendorCoords)) allPoints.push(route.vendorCoords);
      if (isValidCoord(route.customerCoords)) allPoints.push(route.customerCoords);
      if (route.routeGeometry) {
        route.routeGeometry.forEach(p => {
          if (isValidCoord(p)) allPoints.push(p);
        });
      }
    });
    
    if (allPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [routes, map]);
  
  return null;
}

const defaultCenter: [number, number] = [4.6097, -74.0817];

const CourierDeliveryMap = ({ 
  showRoute = false,
  courierLat,
  courierLng,
  customerLat,
  customerLng,
  customerAddress,
}: CourierDeliveryMapProps) => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular ruta cuando hay coordenadas del courier y cliente
  useEffect(() => {
    if (!showRoute || courierLat == null || customerLat == null ||
        isNaN(courierLat) || isNaN(courierLng!) || isNaN(Number(customerLat)) || isNaN(Number(customerLng!))) {
      setRouteGeometry(undefined);
      return;
    }

    const calculateRoute = async () => {
      try {
        const route = await osrmService.getRoute(
          [courierLat!, courierLng!], 
          [Number(customerLat!), Number(customerLng!)]
        );
        setRouteGeometry(route?.geometry);
      } catch (error) {
        console.error('Error calculating route (fallback a línea recta):', error);
        setRouteGeometry([[courierLat!, courierLng!], [Number(customerLat!), Number(customerLng!)]]);
      }
    };

    calculateRoute();
  }, [showRoute, courierLat, courierLng, customerLat, customerLng]);

  // Cargar pedidos activos solo si no se muestran coordenadas externas
  useEffect(() => {
    if (showRoute && courierLat != null && customerLat != null &&
        !isNaN(courierLat) && !isNaN(customerLat)) {
      setLoading(false);
      return;
    }
    
    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 10000);
    return () => clearInterval(interval);
  }, [showRoute, courierLat, customerLat]);

  const loadActiveOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders/courier/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        setRoutes([]);
        return;
      }
      
      const orders = await response.json();
      
      const deliveryRoutes: DeliveryRoute[] = await Promise.all(
        orders.map(async (order: any) => {
          const hasValidVendor = order.vendor_lat != null && !isNaN(order.vendor_lat) &&
                                   order.vendor_lng != null && !isNaN(order.vendor_lng);
          const vendorCoords: [number, number] = hasValidVendor
            ? [order.vendor_lat, order.vendor_lng]
            : (await osrmService.geocodeAddress(order.vendor_address)) || defaultCenter;
          
          const hasValidCustomer = order.customer_lat != null && !isNaN(order.customer_lat) &&
                                     order.customer_lng != null && !isNaN(order.customer_lng);
          const customerCoords: [number, number] = hasValidCustomer
            ? [order.customer_lat, order.customer_lng]
            : (await osrmService.geocodeAddress(order.delivery_address)) || defaultCenter;
          
          let route;
          try {
            route = await osrmService.getRoute(vendorCoords, customerCoords);
          } catch (e) {
            console.error('Error getting route:', e);
            route = null;
          }
          
          return {
            orderId: order.order_id,
            vendorName: order.vendor_name || 'Negocio',
            vendorAddress: order.vendor_address,
            vendorCoords,
            customerName: order.customer_name || 'Cliente',
            customerAddress: order.delivery_address,
            customerCoords,
            routeGeometry: route?.geometry,
            distance: route?.distance,
            duration: route?.duration,
          };
        })
      );
      
      setRoutes(deliveryRoutes);
    } catch (error) {
      console.error('Error loading active orders:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const center: [number, number] = 
    routes.length > 0 && isValidCoord(routes[0].vendorCoords)
      ? routes[0].vendorCoords
      : (courierLat != null && courierLng != null && !isNaN(courierLat) && !isNaN(courierLng))
        ? [courierLat, courierLng]
        : defaultCenter;

  // Si estamos mostrando ruta externa, crear un route temporal
  const showExternalRoute = showRoute && 
    courierLat != null && courierLng != null && 
    customerLat != null && customerLng != null &&
    !isNaN(courierLat) && !isNaN(courierLng) &&
    !isNaN(Number(customerLat)) && !isNaN(Number(customerLng));
  const externalRoute: DeliveryRoute | null = showExternalRoute ? {
    orderId: 'active',
    vendorName: 'Tu ubicación',
    vendorAddress: customerAddress || '',
    vendorCoords: [courierLat!, courierLng!],
    customerName: 'Cliente',
    customerAddress: customerAddress || 'Dirección de entrega',
    customerCoords: [Number(customerLat!), Number(customerLng!)],
    routeGeometry: routeGeometry,
  } : null;

  const displayRoutes = showExternalRoute && externalRoute ? [externalRoute] : routes;

  if (!mounted) {
    return (
      <div className="courier-delivery-map" style={{ height: '100%', background: '#f0f0f0', borderRadius: 12 }} />
    );
  }

  return (
    <div className="courier-delivery-map">
      <div className="courier-delivery-map-header">
        <div className="courier-delivery-map-title">
          <Navigation size={18} />
          <h3>{showExternalRoute ? 'Ruta en Tiempo Real' : 'Rutas de Entrega'}</h3>
        </div>
        <span className="courier-delivery-map-count">
          {displayRoutes.length} pedido{displayRoutes.length !== 1 ? 's' : ''} activo{displayRoutes.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="courier-delivery-map-container">
        <MapContainer center={center} zoom={13} preferCanvas style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds routes={displayRoutes} />
          {displayRoutes.map((route) => (
            <g key={route.orderId}>
              {/* Ruta */}
              {route.routeGeometry && (
                <Polyline
                  positions={route.routeGeometry}
                  color={showExternalRoute ? "#ff6b35" : "#7c3aed"}
                  weight={4}
                  opacity={0.8}
                  dashArray="10, 10"
                />
              )}
              
              {/* Courier (ubicación actual) - solo mostrar en ruta externa */}
              {showExternalRoute && route.vendorCoords && isValidCoord(route.vendorCoords) && (
                <Marker position={route.vendorCoords} icon={
                  L.divIcon({
                    className: "",
                    html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
                      <path d="M7 15a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" fill="#fff"/>
                      <path d="M5 13h3l2-3h4l1 3h3" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  })
                }>
                  <Popup>
                    <strong>🛵 Tu ubicación</strong><br />
                    En tiempo real
                  </Popup>
                </Marker>
              )}
              
              {/* Customer (entrega) */}
              {route.customerCoords && isValidCoord(route.customerCoords) && (
              <Marker position={route.customerCoords} icon={customerIcon}>
                <Popup>
                  <strong>🏁 Entrega</strong><br />
                  {route.customerName}<br />
                  {route.customerAddress}<br />
                  {route.distance && (
                    <>
                      <br />
                      📏 {(route.distance / 1000).toFixed(2)} km<br />
                      ⏱️ {Math.round((route.duration || 0) / 60)} min
                    </>
                  )}
                </Popup>
              </Marker>
              )}
            </g>
          ))}
        </MapContainer>
        
        {displayRoutes.length === 0 && !loading && !showExternalRoute && (
          <div className="courier-delivery-map-empty">
            <Package size={48} />
            <p>No hay pedidos activos</p>
            <span>Los pedidos asignados aparecerán aquí con su ruta</span>
          </div>
        )}
        
        {showExternalRoute && displayRoutes.length === 0 && (
          <div className="courier-delivery-map-empty">
            <Package size={48} />
            <p>Esperando ubicación GPS...</p>
            <span>Activa el GPS para ver la ruta</span>
          </div>
        )}
        
        {loading && routes.length === 0 && (
          <div className="courier-delivery-map-loading">
            Cargando rutas...
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDeliveryMap;