import { Shipment, ShipmentHistoryEntry } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export function getShipments(params: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return request<Shipment[]>(`/api/shipments${qs ? `?${qs}` : ""}`);
}

export function getShipment(id: number) {
  return request<Shipment>(`/api/shipments/${id}`);
}

export function getShipmentHistory(id: number) {
  return request<ShipmentHistoryEntry[]>(`/api/shipments/${id}/history`);
}

export function createShipment(data: {
  reference_number: string;
  origin: string;
  destination: string;
  expected_delivery_date?: string;
}) {
  return request<Shipment>("/api/shipments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShipmentStatus(id: number, status: string, note?: string) {
  return request<Shipment>(`/api/shipments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}