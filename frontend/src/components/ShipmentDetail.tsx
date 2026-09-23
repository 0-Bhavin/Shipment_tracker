import { useEffect, useState } from "react";
import { getShipment, getShipmentHistory, updateShipmentStatus } from "../api";
import { Shipment, ShipmentHistoryEntry, ShipmentStatus, STATUSES } from "../types";
import StatusBadge from "./StatusBadge";

interface Props {
  shipmentId: number;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ShipmentDetail({ shipmentId, onClose, onUpdated }: Props) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistoryEntry[]>([]);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("Booked");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [s, h] = await Promise.all([
      getShipment(shipmentId),
      getShipmentHistory(shipmentId),
    ]);
    setShipment(s);
    setNewStatus(s.current_status);
    setHistory(h);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  async function handleStatusUpdate() {
    setError(null);
    try {
      await updateShipmentStatus(shipmentId, newStatus, note || undefined);
      setNote("");
      await load();
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!shipment) return null;

  return (
    <div className="overlay">
      <div className="box detail-box">
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
        <h2>{shipment.reference_number}</h2>
        <p>
          {shipment.origin} → {shipment.destination}
        </p>
        <p>
          Current status: <StatusBadge status={shipment.current_status} />
        </p>
        <p>Expected delivery: {shipment.expected_delivery_date ?? "—"}</p>

        <div className="update-status">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button onClick={handleStatusUpdate}>Update Status</button>
        </div>
        {error && <p className="error-text">{error}</p>}

        <h3>History</h3>
        <ul className="history-list">
          {history.map((h) => (
            <li key={h.id}>
              <StatusBadge status={h.status} />
              <span className="history-time">
                {new Date(h.changed_at).toLocaleString()}
              </span>
              {h.note && <span className="history-note">— {h.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}