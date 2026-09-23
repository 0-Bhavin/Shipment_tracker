import { Router, Request, Response } from "express";
import { pool } from "../db";
import { isValidStatus, STATUSES } from "../types";

const router = Router();

// GET /api/shipments status and search
router.get("/", async (req: Request, res: Response) => {
  const { status, search } = req.query;

  const conditions: string[] = [];
  const values: string[] = [];

  if (status && typeof status === "string") {
    values.push(status);
    conditions.push(`current_status = $${values.length}`);
  }

  if (search && typeof search === "string") {
    values.push(`%${search}%`);
    conditions.push(`reference_number ILIKE $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT * FROM shipments ${whereClause} ORDER BY created_at DESC`,
    values
  );

  res.json(result.rows);
});

// GET /api/shipments/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query("SELECT * FROM shipments WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Shipment not found" });
  }

  res.json(result.rows[0]);
});

// GET /api/shipments/:id/history
router.get("/:id/history", async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT * FROM shipment_status_history WHERE shipment_id = $1 ORDER BY changed_at ASC",
    [id]
  );

  res.json(result.rows);
});

// POST /api/shipments
router.post("/", async (req: Request, res: Response) => {
  const { reference_number, origin, destination, expected_delivery_date, current_status } =
    req.body;

  if (!reference_number || !origin || !destination) {
    return res
      .status(400)
      .json({ error: "reference_number, origin, and destination are required" });
  }

  const initialStatus = isValidStatus(current_status) ? current_status : "Booked";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const shipmentResult = await client.query(
      `INSERT INTO shipments (reference_number, origin, destination, current_status, expected_delivery_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [reference_number, origin, destination, initialStatus, expected_delivery_date || null]
    );

    const shipment = shipmentResult.rows[0];

    await client.query(
      `INSERT INTO shipment_status_history (shipment_id, status)
       VALUES ($1, $2)`,
      [shipment.id, initialStatus]
    );

    await client.query("COMMIT");
    res.status(201).json(shipment);
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({ error: "reference_number already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create shipment" });
  } finally {
    client.release();
  }
});

// PATCH /api/shipments/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE shipments SET current_status = $1, updated_at = now()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Shipment not found" });
    }

    await client.query(
      `INSERT INTO shipment_status_history (shipment_id, status, note)
       VALUES ($1, $2, $3)`,
      [id, status, note || null]
    );

    await client.query("COMMIT");
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  } finally {
    client.release();
  }
});

export default router;