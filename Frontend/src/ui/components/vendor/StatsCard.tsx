import type { LucideIcon } from "lucide-react";
import "./StatsCard.css";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const StatsCard = ({ title, value, icon: Icon, color }: StatsCardProps) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        <div className={`stats-card-icon ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stats-card-value">{value}</div>
    </div>
  );
};

export default StatsCard;