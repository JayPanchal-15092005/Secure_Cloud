import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { files } from "./schema";

/**
 * Step 1: Create a SQL client using Neon's serverless driver
 *
 * The neon function creates a connection to our Neon PostgreSQL database.
 * It uses the DATABASE_URL environment variable which should contain your connection string.
 *
 */
const sql = neon(process.env.DATABASE_URL!)


/**
 * Step 2: Initialize Drizzle ORM with our schema
 *
 * This creates a database client that we can use to interact with our database.
 * We pass in our schema so Drizzle knows about our table structure.
 */
export const db = drizzle(sql, { schema });

export { sql };