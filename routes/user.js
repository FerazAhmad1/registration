const { signup, login } = require("../controllers/user.js");
const express = require("express");
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

module.exports = router;
