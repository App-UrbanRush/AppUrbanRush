import "./Loading.css";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

const SIZES = {
  sm: { spinner: 24, ring: 36, text: 12 },
  md: { spinner: 40, ring: 58, text: 14 },
  lg: { spinner: 56, ring: 80, text: 16 },
};

const Loading = ({ size = "md", text, fullPage }: LoadingProps) => {
  const dims = SIZES[size];

  const content = (
    <div className="loading-root" data-size={size}>
      <div className="loading-ring" style={{ width: dims.ring, height: dims.ring }}>
        <div className="loading-spinner" style={{ width: dims.spinner, height: dims.spinner }} />
      </div>
      {text && <p className="loading-text" style={{ fontSize: dims.text }}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-overlay">{content}</div>;
  }

  return content;
};

export default Loading;
