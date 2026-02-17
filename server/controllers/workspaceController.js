const pool = require('../db');
const { generateInviteToken } = require("../utils/generateToken");

async function createInvite(req, res) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const memberCheck = await pool.query(
      `SELECT * FROM workspace_members 
       WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const token = generateInviteToken();

    await pool.query(
      `INSERT INTO workspace_invites (workspace_id, token, created_by)
       VALUES ($1, $2, $3)`,
      [workspaceId, token, userId]
    );

    return res.status(201).json({
      inviteLink: `${process.env.FRONTEND_URL}/invite/${token}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createInvite };
