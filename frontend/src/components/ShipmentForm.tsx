import { useState } from "react";
import { createShipment } from "../api";

export default function ShipmentForm({ onCreated }: { onCreated: () => void }) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createShipment({
        reference_number: referenceNumber,
        origin,
        destination,
        expected_delivery_date: expectedDate || undefined,
      });
      setReferenceNumber("");
      setOrigin("");
      setDestination("");
      setExpectedDate("");
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="box" onSubmit={handleSubmit}>
      <h2>New Shipment</h2>
      <div className="field-row">
        <label>
          Reference Number
          <input
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            required
          />
        </label>
        <label>
          Origin
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} required />
        </label>
        <label>
          Destination
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </label>
        <label>
          Expected Delivery
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
        </label>
      </div>
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Shipment"}
      </button>
    </form>
  );
}