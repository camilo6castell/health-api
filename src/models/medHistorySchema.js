const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const medHistorySchema = new Schema({
  idUser: { type: String, required: true },
  idMed: { type: String, required: true },
  idHos: { type: String, required: true },
  speciality: { type: String, required: true },
  healthCondition: { type: String, required: true },
  observations: { type: String, required: true },
});

module.exports = mongoose.model("medHistorySchema", medHistorySchema);
