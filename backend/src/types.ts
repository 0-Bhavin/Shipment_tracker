export const STATUSES = [
  "Booked",
  "In Transit",
  "Customs Hold",
  "Delivered",
  "Cancelled",
] as const;

export type ShipmentStatus = (typeof STATUSES)[number];

export function isValidStatus(value: unknown): value is ShipmentStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export interface Shipment {
  id: number;
  reference_number: string;
  origin: string;
  destination: string;
  current_status: ShipmentStatus;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentHistoryEntry {
  id: number;
  shipment_id: number;
  status: ShipmentStatus;
  note: string | null;
  changed_at: string;
}