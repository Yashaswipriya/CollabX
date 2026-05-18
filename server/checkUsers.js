const pool = require("./db");

async function check() {
  try {
    const users = await pool.query("SELECT id, email, name FROM users");
    const workspaces = await pool.query("SELECT * FROM workspaces");
    const members = await pool.query("SELECT * FROM workspace_members");

    console.log("\nUSERS:");
    console.table(users.rows);

    console.log("\nWORKSPACES:");
    console.table(workspaces.rows);

    console.log("\nWORKSPACE MEMBERS:");
    console.table(members.rows);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();