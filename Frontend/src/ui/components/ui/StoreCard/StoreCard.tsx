import type { Store } from "../../../../domain/types/store.types";
import "./StoreCard.css";

interface StoreCardProps {
  store: Store;
  variant?: "recommended" | "nearby";
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <span style={{ color: '#f59e0b', fontSize: '13px' }}>
      {"\u2605".repeat(full)}{"\u2606".repeat(5 - full)}
    </span>
  );
};

const StoreCard = ({ store, variant = "recommended" }: StoreCardProps) => {
  if (variant === "nearby") {
    return (
      <div
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
          <Stars rating={store.rating} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e8500a', fontWeight: 700, fontSize: '13px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8500a"><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
            {store.rating}
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
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '2px', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="store-card-rec"
      style={{
        flexShrink: 0,
        width: '148px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.09)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
    >
      <img src={store.image} alt={store.name} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Stars rating={store.rating} />
          <span style={{ color: '#bbb', fontSize: '11px', margin: '0 2px' }}>{'\u2022'}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8500a" style={{ flexShrink: 0 }}><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
          <span style={{ fontSize: '11px', color: '#888' }}>{store.deliveryTime}</span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
