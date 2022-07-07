#!/usr/bin/env node

const Mongoose = require("mongoose");

const AMDSchema = new Mongoose.Schema({
  "name": {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  }
}, {
  collection: "amd-rs",
});

const AMD = Mongoose.model("AMD-R", AMDSchema);

module.exports = AMD;
