import { Pool } from "pg"
import { config } from "dotenv"

config({ path: ".env.local" })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    // Direct SQL update with correct column name
    const result = await client.query(`UPDATE users SET "organizationId" = NULL WHERE email = 'stickerey@gmail.com' RETURNING id, email, role, "organizationId"`)
    console.log("Updated:", result.rows)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
