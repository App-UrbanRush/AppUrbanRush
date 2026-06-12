import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useCart } from "../../../context/useCart";
import { useFavorites } from "../../../context/useFavorites";
import "./Navbar.css";

const Navbar = () => {
  const { user, myProfile, fetchMyProfile, logout, isAuthenticated } = useAuth();
  const { openCart, count } = useCart();
  const { count: favCount } = useFavorites();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const q = searchQuery.trim();
    navigate(q ? `/tiendas?q=${encodeURIComponent(q)}` : "/tiendas");
    setSearchOpen(false);
  };
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-row" style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', height: '64px', gap: '14px', position: 'relative' }}>

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
        <Link to="/dashboard" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/Logo-png.png" alt="UrbanRush" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ color: '#e8500a', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px' }}>UrbanRush</span>
        </Link>

        {/* Spacer for mobile */}
        <div className="navbar-spacer" style={{ display: 'none', flex: 1 }} />

        {/* Search bar - desktop */}
        <div className={`search-bar-desktop${searchOpen ? " search-bar-desktop--open" : ""}`} style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: '24px', padding: '8px 16px', gap: '8px' }}>
          <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="¿Qué deseas pedir hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#555', width: '100%' }}
          />
        </div>

        {/* Location - desktop (solo si autenticado) */}
        {isAuthenticated && (
          <div className="location-desktop" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#444', fontSize: '13px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="15" height="15" fill="#e8500a" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
            </svg>
            <span>Envía a: <strong>{myProfile?.address || "Mi Ubicación"}</strong></span>
          </div>
        )}

        {/* Favorites + Cart - desktop */}
        <div className="icons-desktop" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <button onClick={() => navigate('/favoritos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: favCount > 0 ? '#ff3d6e' : '#666', position: 'relative', padding: 0 }} title="Favoritos">
            <svg width="22" height="22" fill={favCount > 0 ? '#ff3d6e' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
            </svg>
            {favCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3d6e', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{favCount}</span>
            )}
          </button>
          <button onClick={openCart} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}>
            <svg width="22" height="22" fill="none" stroke="#e8500a" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1.4-6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zM17 19a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e8500a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span>
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
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {myProfile?.avatarUrl
                ? <img src={myProfile.avatarUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.6-9 6v1a1 1 0 001 1h16a1 1 0 001-1v-1c0-3.4-4-6-9-6z"/></svg>}
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
                <div style={{ padding: '0 16px 10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#222' }}>{displayName}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{user?.email}</div>
                  <div style={{ fontSize: '12px', color: '#e8500a', marginTop: '4px', fontWeight: 600 }}>
                    {userRole}
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
                  <span style={{ fontSize: '16px' }}>⚙️</span>
                  Mi perfil
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: '#444',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🚪</span>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="login-btn-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/register-select"
              style={{
                background: '#fff',
                color: '#e8500a',
                border: '1.5px solid #e8500a',
                borderRadius: '24px',
                padding: '5px 15px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Registrarme
            </Link>
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
                whiteSpace: 'nowrap',
              }}
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {/* Icons - mobile (search + cart) */}
        <div className="icons-mobile" style={{ display: 'none', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Buscar"
          >
            <svg width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button onClick={openCart} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}>
            <svg width="20" height="20" fill="none" stroke="#e8500a" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1.4-6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zM17 19a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e8500a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span>
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
                    background: '#e8500a',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {myProfile?.avatarUrl
                      ? <img src={myProfile.avatarUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.6-9 6v1a1 1 0 001 1h16a1 1 0 001-1v-1c0-3.4-4-6-9-6z"/></svg>}
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

                  <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <svg width="18" height="18" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                    </svg>
                    Favoritos
                  </button>
                </div>

                <div style={{ height: '1px', background: '#eee', margin: '0 16px' }} />

                <div style={{ padding: '8px 0' }}>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#444', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '16px' }}>⚙️</span>
                    Mi perfil
                  </Link>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#c0392b', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '16px' }}>🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                <Link
                  to="/register-select"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    color: '#e8500a',
                    border: '1.5px solid #e8500a',
                    borderRadius: '24px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

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
          .navbar-spacer { order: 4; display: block !important; }
          .icons-mobile { order: 5; }
          .login-btn-wrapper { order: 5; }

          .search-bar-desktop {
            display: none !important;
          }
          .search-bar-desktop.search-bar-desktop--open {
            display: flex !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin: 0;
            border-radius: 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
            z-index: 100;
            padding: 8px 16px !important;
            background-color: #fff !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
