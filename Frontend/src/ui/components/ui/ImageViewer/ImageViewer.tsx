import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./ImageViewer.css";

interface ImageViewerProps {
  images?: string[] | null;
  initialIndex?: number;
  imageUrl?: string | null;
  onClose: () => void;
}

const ImageViewer = ({ images, initialIndex = 0, imageUrl, onClose }: ImageViewerProps) => {
  const allImages = images ?? (imageUrl ? [imageUrl] : []);
  const [index, setIndex] = useState(initialIndex);
  const hasMultiple = allImages.length > 1;

  useEffect(() => {
    if (allImages.length === 0) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i > 0 ? i - 1 : allImages.length - 1));
      if (e.key === "ArrowRight") setIndex((i) => (i < allImages.length - 1 ? i + 1 : 0));
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [allImages.length, onClose]);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  if (allImages.length === 0) return null;

  return (
    <div className="iv-overlay" onClick={onClose}>
      <button className="iv-close" onClick={onClose}>
        <X size={24} />
      </button>

      {hasMultiple && (
        <>
          <button className="iv-arrow iv-arrow--left" onClick={(e) => { e.stopPropagation(); setIndex((i) => (i > 0 ? i - 1 : allImages.length - 1)); }}>
            <ChevronLeft size={28} />
          </button>
          <button className="iv-arrow iv-arrow--right" onClick={(e) => { e.stopPropagation(); setIndex((i) => (i < allImages.length - 1 ? i + 1 : 0)); }}>
            <ChevronRight size={28} />
          </button>
          <div className="iv-counter">{index + 1} / {allImages.length}</div>
        </>
      )}

      <img
        src={allImages[index]}
        alt=""
        className="iv-image"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageViewer;
