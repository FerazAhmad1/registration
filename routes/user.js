const { signup, login, forgotPassword } = require("../controllers/user.js");
const express = require("express");
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
module.exports = router;
