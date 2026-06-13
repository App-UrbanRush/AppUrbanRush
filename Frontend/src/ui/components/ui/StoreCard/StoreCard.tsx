import type { Store } from "../../../../domain/types/store.types";
import { useFavorites } from "../../../context/useFavorites";
import "./StoreCard.css";

interface StoreCardProps {
  store: Store;
  variant?: "recommended" | "nearby";
  onClick?: () => void;
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <span style={{ color: '#f59e0b', fontSize: '13px' }}>
      {"\u2605".repeat(full)}{"\u2606".repeat(5 - full)}
    </span>
  );
};

const StoreCard = ({ store, variant = "recommended", onClick }: StoreCardProps) => {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(store.id);
  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(store.id, store.name);
  };

  if (variant === "nearby") {
    return (
      <div
        onClick={onClick}
        className="store-card-nearby"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          padding: '10px',
          cursor: 'pointer',
        }}
      >
        <img
          src={store.image}
          alt={store.name}
          style={{ width: '80px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.name}
          </div>
          <Stars rating={store.rating ?? 0} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e8500a', fontWeight: 700, fontSize: '13px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8500a"><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
            {store.rating ?? 0}
          </span>
          <span style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            color: '#666',
          }}>
            {store.deliveryTime}
          </span>
        </div>
        <button onClick={handleFav} title="Favorito" style={{ background: 'none', border: 'none', cursor: 'pointer', color: fav ? '#ff3d6e' : '#ccc', padding: '2px', flexShrink: 0 }}>
          <svg width="18" height="18" fill={fav ? '#ff3d6e' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="store-card-rec"
      style={{
        flexShrink: 0,
        width: '230px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img src={store.image} alt={store.name} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
        <button onClick={handleFav} title="Favorito" style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="16" height="16" fill={fav ? '#ff3d6e' : 'none'} stroke={fav ? '#ff3d6e' : '#666'} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
          </svg>
        </button>
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '14px',
          padding: '3px 9px', fontSize: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <svg width="11" height="11" viewBox="0 0 10 10" fill="#ffb300"><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
          {store.rating ?? 0}
        </span>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Stars rating={store.rating ?? 0} />
          <span style={{ color: '#ccc', fontSize: '12px' }}>{'\u2022'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12.5px', color: '#777', fontWeight: 600 }}>
            <svg width="12" height="12" fill="none" stroke="#e8500a" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/></svg>
            {store.deliveryTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
