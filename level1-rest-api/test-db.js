
const pool = require("./db");

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");

    const [rows] = await connection.query("SELECT DATABASE() AS db");
    console.log("Connected database:", rows[0].db);

    connection.release();
    await pool.end();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  }
}

testConnection();
