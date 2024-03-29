const {
  signup,
  login,
  forgotPassword,
  resetPaswword,
  activate,
} = require("../controllers/user.js");
const express = require("express");
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword/:token", resetPaswword);
router.patch("/activate", activate);
module.exports = router;
