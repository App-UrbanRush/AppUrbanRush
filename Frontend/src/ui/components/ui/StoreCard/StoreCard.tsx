import { useNavigate } from "react-router-dom";
import type { Store } from "../../../../domain/types/store.types";
import "./StoreCard.css";

interface StoreCardProps {
  store: Store;
  variant?: "recommended" | "nearby";
}

const Stars: React.FC<{ rating?: number }> = ({ rating }) => {
  if (rating === undefined || rating === null) return null;
  const full = Math.floor(rating);
  return (
    <span style={{ color: '#f59e0b', fontSize: '13px' }}>
      {"\u2605".repeat(full)}{"\u2606".repeat(5 - full)}
    </span>
  );
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
};

const InitialsBadge: React.FC<{ name: string; size?: 'small' | 'large' }> = ({ name, size = 'small' }) => {
  const bgColor = getColorFromName(name);
  const initials = getInitials(name);
  const isLarge = size === 'large';
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isLarge ? '100%' : '80px',
        height: isLarge ? '160px' : '64px',
        backgroundColor: bgColor,
        color: 'white',
        borderRadius: isLarge ? '12px' : '10px',
        fontSize: isLarge ? '48px' : '16px',
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
};

const StoreCard = ({ store, variant = "recommended" }: StoreCardProps) => {
  const navigate = useNavigate();
  const cardImage = store.logo_url  || '';
  const hasImage = cardImage.trim().length > 0;
  
  const handleCardClick = () => {
    navigate(`/store/${store.id}`);
  };
  
  if (variant === "nearby") {
    return (
      <div
        className="store-card-nearby"
        onClick={handleCardClick}
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
        {hasImage ? (
          <img
            src={cardImage}
            alt={store.name}
            style={{ width: '80px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <InitialsBadge name={store.name} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.name}
          </div>
          {store.business_type && (
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
              {store.business_type}
            </div>
          )}
          <Stars rating={store.rating} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {store.rating !== undefined && store.rating !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e8500a', fontWeight: 700, fontSize: '13px' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8500a"><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
              {store.rating}
            </span>
          )}
          {store.deliveryTime && (
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
          )}
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
      onClick={handleCardClick}
      style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: '280px',
        minWidth: '250px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.09)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
        margin: '0 auto',
      }}
    >
      {hasImage ? (
        <img src={cardImage} alt={store.name} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
      ) : (
        <InitialsBadge name={store.name} size="large" />
      )}
      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.name}
        </div>
        {store.business_type && (
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
            {store.business_type}
          </div>
        )}
        {store.description && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {store.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Stars rating={store.rating} />
          {store.rating !== undefined && store.rating !== null && store.deliveryTime && (
            <span style={{ color: '#bbb', fontSize: '11px', margin: '0 2px' }}>{'\u2022'}</span>
          )}
          {store.deliveryTime && (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8500a" style={{ flexShrink: 0 }}><polygon points="5,1 6.5,4 10,4.5 7.5,7 8.1,10.5 5,8.8 1.9,10.5 2.5,7 0,4.5 3.5,4"/></svg>
              <span style={{ fontSize: '11px', color: '#888' }}>{store.deliveryTime}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
