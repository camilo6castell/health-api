const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const userSchema = new Schema({
  idUser: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: String, required: true },
  verified: { activated: { type: Boolean }, token: { type: String } },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("userSchema", userSchema);
