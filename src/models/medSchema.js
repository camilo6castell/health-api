import mongoose from "mongoose";

const { Schema } = require("mongoose");

const medSchema = new Schema({
  idMed: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: Date, required: true },
  verified: { type: Boolean, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  sessionNum: { type: Number, required: true },
});

module.exports = mongoose.model("modSchema", medSchema);
