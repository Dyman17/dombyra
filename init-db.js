const { Pool } = require("pg");

// This script initializes the database schema
// It should be run once to set up the database tables

async function initDatabase() {
  // For local testing, you would set the DATABASE_URL environment variable
  // For Render, this would use the DATABASE_URL provided by the platform
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || "postgresql://localhost/dombyra"
  });

  try {
    // Create tables with proper constraints
    await pool.query(`
      CREATE TABLE IF NOT EXISTS people (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pieces (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS knows (
        person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
        piece_id INTEGER REFERENCES pieces(id) ON DELETE CASCADE,
        PRIMARY KEY (person_id, piece_id)
      );
    `);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error.message);
    console.log("Note: This is expected if you haven't set up a PostgreSQL database yet.");
    console.log("For Render deployment, this will work with the DATABASE_URL environment variable.");
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // Ignore errors when closing connection
    }
  }
}

initDatabase();