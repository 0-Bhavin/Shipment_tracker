import { useEffect, useState } from "react";
import { getShipments } from "./api";
import { Shipment } from "./types";
import ShipmentForm from "./components/ShipmentForm";
import ShipmentList from "./components/ShipmentList";
import ShipmentDetail from "./components/ShipmentDetail";
import "./App.css";

export default function App() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function refresh() {
    const data = await getShipments({ status, search });
    setShipments(data);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div className="app">
      <header>
        <h1>Shipment Status Tracker</h1>
      </header>

      <ShipmentForm onCreated={refresh} />

      <ShipmentList
        shipments={shipments}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSelect={setSelectedId}
      />

      {selectedId !== null && (
        <ShipmentDetail
          shipmentId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}