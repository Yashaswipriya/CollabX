const express = require('express');
const { acceptInvite } = require("../controllers/inviteController");
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post("/:token/accept", authMiddleware, acceptInvite);

module.exports = router;
