import { Shipment, ShipmentStatus, STATUSES } from "../types";
import StatusBadge from "./StatusBadge";

interface Props {
  shipments: Shipment[];
  search: string;
  status: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSelect: (id: number) => void;
}

export default function ShipmentList({
  shipments,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onSelect,
}: Props) {
  return (
    <div className="box">
      <h2>Shipments</h2>
      <div className="filters">
        <input
          placeholder="Search by reference number"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s: ShipmentStatus) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Expected Delivery</th>
          </tr>
        </thead>
        <tbody>
          {shipments.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-row">
                No shipments found.
              </td>
            </tr>
          )}
          {shipments.map((s) => (
            <tr key={s.id} onClick={() => onSelect(s.id)} className="clickable-row">
              <td>{s.reference_number}</td>
              <td>{s.origin}</td>
              <td>{s.destination}</td>
              <td>
                <StatusBadge status={s.current_status} />
              </td>
              <td>{s.expected_delivery_date ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}