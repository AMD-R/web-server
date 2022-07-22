#!/usr/bin/env node

const Mongoose = require('mongoose');

const AMDSchema = new Mongoose.Schema({
  'name': {
    type: String,
    unique: true,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  key: {
    type: String,
    required: true,
  },
}, {
  collection: 'amd-rs',
});

const AMD = Mongoose.model('AMD-R', AMDSchema);

module.exports = AMD;
