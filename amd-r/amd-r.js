#!/usr/bin/env node
const data = require("../model/amd-r-data");
const amdr = require("../model/AMD-R");
const bcrypt = require("bcryptjs");
const Mongoose = require("mongoose");

async function subscriber(req, res, next) {
  const { gps, battery, speed, mission } = req.body;
  const model = Mongoose.model(req.id, data, req.id);
  const cTime = new Date();

  if (gps && battery && speed && mission) {
    await model.create({
      gps: {
        lon: gps.lon,
        lat: gps.lat,
      },
      battery: battery,
      speed: speed,
      mission: mission,
      Time: cTime.toGMTString()
    })
      .then((amdr_data) => {
        res.status(200).json({
          message: "Succesfully Recieved AMD-R data",
          time: cTime.toGMTString(),
          name: req.name,
        })
      })
      .catch((err) => {
        res.status(400).json({
          message: "Data updating failed",
          error: err.message,
        })
      })
  } else {
    return res.status(400).json({ message: "Not enough data given" });
  }
}

async function register(req, res, next) {
  const { name, password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  bcrypt.hash(password, 10).then(async (hash) => {
    await amdr.create({
      name,
      password: hash,
      verified: false,
    })
      .then((user) => {
        res.status(201).json({
          message: "AMD-R successfully registered",
        })
      })
      .catch((error) => {
        res.status(400).json({
          message: "AMD-R registration failed",
          error: error.message,
        })
      });
  });
}

async function getAMDRs(req, res, next) {
  await amdr.find({})
    .then((amdrs) => {
      const formated = amdrs.map((amdr) => {
        const container = new Object;
        container.name = amdr.name;
        container.id = amdr._id;
        container.verified = amdr.verified;

        return container;
      });
      res.status(200).json({"AMD-Rs": formated});
    })
    .catch((err) => res.status(400).json({
      message: "Failed to fet AMD-Rs",
      error: err.message,
    }))
}

module.exports = {
  subscriber,
  register,
  getAMDRs,
};
