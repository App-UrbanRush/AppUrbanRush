import { useRef, useState } from "react";
import type { Store } from "../../../domain/types/store.types";
import StoreCard from "../ui/StoreCard/StoreCard";
import StoreDetailModal from "../store/StoreDetailModal";
import "./RecommendedStores.css";

interface RecommendedStoresProps {
  stores: Store[];
}

const RecommendedStores = ({ stores }: RecommendedStoresProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Store | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
    }
  };

  return (
    <section style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 className="home-section-title" style={{ margin: 0 }}>Recomendados para Ti</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {["left", "right"].map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir as "left" | "right")}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: '1px solid #ddd', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: '#555', lineHeight: 1,
              }}
            >
              {dir === "left" ? "\u2039" : "\u203A"}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}
      >
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} variant="recommended" onClick={() => setSelected(store)} />
        ))}
      </div>
      {selected && <StoreDetailModal store={selected} onClose={() => setSelected(null)} />}
    </section>
  );
};

export default RecommendedStores;
