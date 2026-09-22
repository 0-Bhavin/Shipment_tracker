CREATE TABLE IF NOT EXISTS shipments (
  id                      SERIAL PRIMARY KEY,
  reference_number        TEXT NOT NULL UNIQUE,
  origin                  TEXT NOT NULL,
  destination             TEXT NOT NULL,
  current_status          TEXT NOT NULL DEFAULT 'Booked',
  expected_delivery_date  DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipment_status_history (
  id           SERIAL PRIMARY KEY,
  shipment_id  INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status       TEXT NOT NULL,
  note         TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (current_status);
CREATE INDEX IF NOT EXISTS idx_shipments_reference ON shipments (reference_number);
CREATE INDEX IF NOT EXISTS idx_history_shipment_id ON shipment_status_history (shipment_id);