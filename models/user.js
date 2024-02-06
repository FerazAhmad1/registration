const mongoose = require("mongoose");
const validator = require("validator");
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
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
