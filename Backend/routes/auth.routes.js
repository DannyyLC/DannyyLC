const express = require('express');
const { login } = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/login
router.post("/login", login);

module.exports = router;
