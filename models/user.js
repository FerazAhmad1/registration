const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    reuired: [true, "please provide the name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "please provide email"],
    lowercase: true,
    validate: [validator.isEmail, "please  provide a valid email "],
  },
  image: {
    type: String,
    required: [true, "please provide email"],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    required: [true, "please provide role"],
  },
  password: {
    type: String,
    required: [true, "please provide the password"],
    minlength: 8,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpire: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctpassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};

userSchema.methods.createRandomToken = function () {
  const randomToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return randomToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
