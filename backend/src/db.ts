import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Most managed Postgres hosts (Railway, Render, etc.) require SSL in production
// but reject it for local connections — this switches based on NODE_ENV.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});