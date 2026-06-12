import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { HeroBanner as HeroBannerType } from "../../../domain/types/store.types";
import "./HeroBanner.css";

interface HeroBannerProps {
  data: HeroBannerType;
}

// Carrusel de comidas y accesorios de delivery
const SLIDES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&h=560&fit=crop&q=80", // hamburguesa
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&h=560&fit=crop&q=80", // pizza
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&h=560&fit=crop&q=80", // sushi
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&h=560&fit=crop&q=80", // platos
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1400&h=560&fit=crop&q=80", // delivery
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&h=560&fit=crop&q=80", // café
];

const ROTATE_MS = 4500;

const HeroBanner = ({ data }: HeroBannerProps) => {
  const { title, subtitle, buttonText } = data;
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero-banner">
      {/* Carrusel de imágenes */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className={`hero-slide ${i === active ? "active" : ""}`}
          style={{ backgroundImage: `url(${src})` }}
          aria-hidden={i !== active}
        />
      ))}

      {/* Degradado para legibilidad del texto */}
      <div className="hero-overlay" />

      {/* Contenido (texto original intacto) */}
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <button className="hero-banner-cta" onClick={() => navigate("/tiendas")}>{buttonText}</button>
      </div>

      {/* Indicadores */}
      <div className="hero-dots">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            className={`hero-dot ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
