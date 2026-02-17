const pool = require('../db');

async function acceptInvite(req, res) {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const inviteResult = await pool.query(
      `SELECT * FROM workspace_invites WHERE token = $1`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ message: "Invalid invite" });
    }

    const invite = inviteResult.rows[0];

    await pool.query(
      `INSERT INTO workspace_members (user_id, workspace_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, workspace_id) DO NOTHING`,
      [userId, invite.workspace_id, invite.role]
    );

    await pool.query(
      `DELETE FROM workspace_invites WHERE token = $1`,
      [token]
    );

    return res.status(200).json({
      message: "Joined workspace successfully",
      workspaceId: invite.workspace_id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { acceptInvite };
