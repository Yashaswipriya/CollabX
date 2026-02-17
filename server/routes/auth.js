const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req,res) =>{
    try{
        const {email,name,password} = req.body;

        // Check if user already exists
        const existing = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        if(existing.rows.length>0){
            return res.status(400).json({message:"User already exists"});
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password,10);
        // Insert new user
        const newUser = await pool.query("INSERT INTO users (email,name,password_hash) VALUES ($1,$2,$3)",[email,name,passwordHash]);
        res.status(201).json({ message: "User created successfully" });

    }
    catch(err){
        console.error(err.message);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/login", async (req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await pool.query("SELECT id, name, password_hash FROM users WHERE email = $1",[email]);
        if(user.rows.length === 0){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const userDetails = user.rows[0];
        const isMatch = await bcrypt.compare(password,userDetails.password_hash);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = jwt.sign(
        { id: userDetails.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
        );
        res.json({ token, name:userDetails.name });
    }
    //Here user is an object which contains the user details in an array called rows.
    //so user details are accessed using user.rows[0] where 0 is the index of the first user in the array.
    //Each user detail is obtained as userDetails.password_hash for password hash since userDetails is assigned user.rows[0].
    catch(err){
        console.error(err.message);
        res.status(500).json({message:"Server error"});
    }
});
module.exports = router;