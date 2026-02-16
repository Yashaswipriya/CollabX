const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post("/block", authMiddleware, async (req,res) =>{
    try{
        const {workspace_id, type, content, position} = req.body;
        if(!workspace_id || !type || position == undefined){
            return res.status(400).json({message: "All fields are required"});
        }
        const existingBlock = await pool.query("SELECT id FROM blocks WHERE workspace_id = $1 AND position = $2", [workspace_id, position]);
        if(existingBlock.rows.length > 0){
            return res.status(409).json({message: "Block already exists at this position"});
        }
        const newBlock = await pool.query("INSERT INTO blocks (workspace_id, type, content, position) VALUES ($1, $2, $3, $4) RETURNING *", [workspace_id, type, content ?? {}, position]);
        res.json(newBlock.rows[0]);
    } catch(err){
        console.error(err.message);
        res.status(500).json({message: "Server error"});
    }
});

router.put("/block/:id", authMiddleware, async (req,res) =>{
    try{
        const {id} = req.params;
        const {type, content, position, version} = req.body;
        const blockRes = await pool.query("SELECT * FROM blocks WHERE id = $1", [id]);
        if(blockRes.rows.length === 0){
            return res.status(404).json({message: "Block not found"});
        }
        const block = blockRes.rows[0];
        if(block.version !== version){
            return res.status(409).json({message: "Block has been modified by somebody else."});
        }
        if(type === undefined || type === ""){
            return res.status(400).json({message: "Type is required"});
        }
        if (position !== undefined && position < 0) {
            return res.status(400).json({ message: "Invalid position" });
        }
        const updatedBlock = await pool.query("UPDATE blocks SET type = $1, content = $2, position = $3, version = version+1 WHERE id = $4 RETURNING *", [type ?? block.type, content ?? block.content, position ?? block.position, id]);
        res.json(updatedBlock.rows[0]);
    }
    //Mistake: Violation of UNIQUE constraint on position within the same workspace is not handled.
    catch(err){
        //23505 is the code for unique violation in PostgreSQL
        if (err.code === "23505") {
        return res.status(409).json({ message: "Another block already exists at this position" });
    }
        console.error(err.message);
        res.status(500).json({message: "Server error"});
    }
});

router.get("/block/:workspace_id", authMiddleware, async (req,res) =>{
    try{
        const {workspace_id} = req.params;
        const userId = req.user.id;
        if (!workspace_id) {
        return res.status(400).json({ message: "Workspace ID is required" });
        }
        const membership = await pool.query(
            "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
            [workspace_id, userId]
        );

        if (membership.rows.length === 0) {
            return res.status(403).json({ message: "Access denied to this workspace" });
        }
        const blocks = await pool.query("SELECT * FROM blocks WHERE workspace_id = $1 ORDER BY position ASC", [workspace_id]);
        res.json(blocks.rows);
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({message: "Server error"});
    }
});

module.exports = router;