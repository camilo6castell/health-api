const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const hosSchema = new Schema({
  idHos: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  services: [{ type: String, required: true }],
  verified: { type: Boolean, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("hosSchema", hosSchema);
