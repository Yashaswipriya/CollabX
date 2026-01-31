const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post("/workspace", authMiddleware, async (req,res) =>{
    try{
        const {name} = req.body;
        const owner_id = req.user.id; // Mistake: You should derive it from JWT, not from client input.
        if(!name || name.trim() === ""){
            return res.status(400).json({message:"Workspace name is required"});
        }
        const existingWorkspace = await pool.query("SELECT * FROM workspaces WHERE name = $1 AND owner_id = $2",[name.trim(),owner_id]);
        if(existingWorkspace.rows.length>0){
            return res.status(400).json({message:"Workspace already exists"});
        }

        const newWorkspace = await pool.query("INSERT INTO workspaces (name,owner_id) VALUES ($1,$2) RETURNING id,name",[name.trim(),owner_id]);
        res.status(201).json({ "New Workspace Created": newWorkspace.rows[0] });

        const workspaceId = newWorkspace.rows[0].id;
        await pool.query("INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3)",[workspaceId,owner_id,'owner']);
        return res.status(201).json({message:"Workspace created successfully", workspace_id: workspaceId, name: newWorkspace.rows[0].name});
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({message:"Server error"});
    }
});