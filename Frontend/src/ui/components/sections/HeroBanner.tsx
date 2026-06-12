import { useNavigate } from "react-router-dom";
import type { HeroBanner as HeroBannerType } from "../../../domain/types/store.types";
import "./HeroBanner.css";

interface HeroBannerProps {
  data: HeroBannerType;
}

const HeroBanner = ({ data }: HeroBannerProps) => {
  const { title, subtitle, buttonText } = data;
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      minHeight: '200px',
      background: '#3a1a06',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '28px',
    }}>
      <img
        src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&h=350&fit=crop"
        alt="Comida"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '60%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, #3a1a06 0%, #3a1a06 38%, rgba(58,26,6,0.7) 60%, rgba(58,26,6,0) 100%)',
      }} />
      <div style={{ position: 'relative', zIndex: 2, padding: '36px 32px', maxWidth: '55%' }}>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(20px,4vw,36px)', lineHeight: 1.2, margin: '0 0 10px' }}>
          {title}
        </h1>
        <p style={{ color: 'rgba(255,220,180,0.9)', fontSize: 'clamp(13px,2vw,16px)', margin: '0 0 22px' }}>
          {subtitle}
        </p>
        <button
          className="hero-banner-cta"
          onClick={() => navigate('/stores')}
          style={{
            backgroundColor: '#e8500a',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(232,80,10,0.4)',
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
