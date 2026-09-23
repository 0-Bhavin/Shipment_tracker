import { ShipmentStatus } from "../types";

const COLORS: Record<ShipmentStatus, string> = {
  Booked: "#6b7280",
  "In Transit": "#2563eb",
  "Customs Hold": "#b45309",
  Delivered: "#15803d",
  Cancelled: "#b91c1c",
};

export default function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: COLORS[status] }}
    >
      {status}
    </span>
  );
}