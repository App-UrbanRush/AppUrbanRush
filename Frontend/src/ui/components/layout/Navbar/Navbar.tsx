import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useCart } from "../../../context/CartContext";
import { useCartDrawer } from "../../../context/CartDrawerContext";
import { User, ShoppingBag, CreditCard, LogOut } from "lucide-react";
import CartDrawer from "./CartDrawer";
import NotificationBell from "../../ui/NotificationBell";
import "./Navbar.css";

const Navbar = () => {
  const { user, myProfile, fetchMyProfile, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { isOpen: cartOpen, openCart, closeCart } = useCartDrawer();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProfile();
    }
  }, [isAuthenticated, fetchMyProfile]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close mobile sidebar on overlay click
  useEffect(() => {
    const handleSidebarOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleSidebarOutside);
    }
    return () => document.removeEventListener("mousedown", handleSidebarOutside);
  }, [mobileMenuOpen]);

  const displayName = myProfile
    ? `${myProfile.firstName} ${myProfile.firstLastName}`
    : user?.name || "Usuario";

  const userRole = user?.role || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
    <nav style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-row" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: '60px', gap: '12px', position: 'relative' }}>

        {/* Hamburger - mobile (solo si autenticado) */}
        {isAuthenticated && (
          <button
            onClick={() => { setMobileMenuOpen(true); setDropdownOpen(false); }}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
            className="mobile-menu-btn"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <div className="navbar-logo-wrap">
            <img src="/Logo-cor.png" alt="UrbanRush" style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </Link>

        {/* Inicio moved to the right side */}

        {/* Spacer for mobile */}
        <div className="navbar-spacer" style={{ display: 'none', flex: 1 }} />

        {/* Location moved to the right side */}

        {/* Right-side: Inicio + Envía a + Cart + Avatar/Login */}
        <div className="navbar-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Inicio (moved) */}
          <Link to="/" className="navbar-home-btn" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid transparent', background: '#fff', color: '#444', fontWeight: 600 }}>Inicio</div>
          </Link>

          {/* Location (moved) - desktop only */}
          {isAuthenticated && (
            <div className="location-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#444', fontSize: '13px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <svg width="15" height="15" fill="#e8500a" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
              </svg>
              <span style={{ fontSize: '13px' }}>Envía a: <strong>{myProfile?.address || "Mi Ubicación"}</strong></span>
            </div>
          )}

          <div className="icons-desktop" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            {isAuthenticated && <NotificationBell />}
            <button onClick={() => openCart()} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}>
              <svg width="22" height="22" fill="none" stroke="#e8500a" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1.4-6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zM17 19a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e8500a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{totalItems}</span>
              )}
            </button>
          </div>

          {/* Avatar - desktop right (solo si autenticado) */}
          {isAuthenticated ? (
            <div className="profile-avatar-wrapper" ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                background: '#e8500a',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {myProfile?.avatarUrl ? (
                <img src={myProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                avatarLetter
              )}
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '240px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '12px 0',
                zIndex: 200,
              }}>
                <div style={{ padding: '12px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: myProfile?.avatarUrl ? 'none' : '#e8500a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {myProfile?.avatarUrl ? (
                      <img src={myProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{avatarLetter}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                    <div style={{ fontSize: '11px', color: '#e8500a', marginTop: '2px', fontWeight: 600 }}>{userRole}</div>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#eee', margin: '0 12px' }} />

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: '#444',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <User size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                  Mi perfil
                </Link>

                <Link
                  to="/my-orders"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: '#444',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <ShoppingBag size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                  Mis pedidos
                </Link>

                <Link
                  to="/payment-history"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: '#444',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                  Pagos
                </Link>

                <div style={{ height: '1px', background: '#eee', margin: '0 12px' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} style={{ flexShrink: 0 }} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="login-btn-wrapper" style={{ flexShrink: 0 }}>
              <Link
                to="/login"
                style={{
                  background: '#e8500a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>

        {/* Icons - mobile (notifications + cart) */}
        <div className="icons-mobile" style={{ display: 'none', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {isAuthenticated && <NotificationBell />}
          <button onClick={() => openCart()} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}>
            <svg width="20" height="20" fill="none" stroke="#e8500a" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1.4-6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zM17 19a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e8500a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>



      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-sidebar" ref={sidebarRef}>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12"/>
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                {/* User info */}
                <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: myProfile?.avatarUrl ? 'none' : '#e8500a',
                  }}>
                    {myProfile?.avatarUrl ? (
                      <img src={myProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{avatarLetter}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '1px' }}>{user?.email}</div>
                    <div style={{ fontSize: '12px', color: '#e8500a', fontWeight: 600, marginTop: '2px' }}>{userRole}</div>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#eee', margin: '0 16px' }} />

                {/* Nav links */}
                <div style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444' }}>
                    <svg width="16" height="16" fill="#e8500a" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
                    </svg>
                    <span>Envía a: <strong>{myProfile?.address || "Mi Ubicación"}</strong></span>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#eee', margin: '0 16px' }} />

                <div style={{ padding: '8px 0' }}>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <User size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                    Mi perfil
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <ShoppingBag size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                    Mis pedidos
                  </Link>

                  <Link
                    to="/payment-history"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <CreditCard size={16} style={{ flexShrink: 0, color: '#6b7280' }} />
                    Pagos
                  </Link>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#dc2626', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <LogOut size={16} style={{ flexShrink: 0 }} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '20px 16px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e8500a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </nav>

      <CartDrawer isOpen={cartOpen} onClose={closeCart} />

      <style>{`
        @media (max-width: 768px) {
          .profile-avatar-wrapper { display: none !important; }
          .location-desktop { display: none !important; }
          .icons-desktop { display: none !important; }
          .icons-mobile { display: flex !important; }
          .mobile-menu-btn { display: flex !important; }

          .navbar-row { gap: 8px !important; }
          .navbar-logo { order: 3; }
          .mobile-menu-btn { order: 1; }
          .navbar-right { order: 5; }
          .navbar-spacer { order: 4; display: block !important; }
          .icons-mobile { order: 6; }
          .login-btn-wrapper { order: 5; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
