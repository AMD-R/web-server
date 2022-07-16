#!/usr/bin/env node
const data = require("../model/amd-r-data");
const amdr = require("../model/AMD-R");
const bcrypt = require("bcryptjs");
const Mongoose = require("mongoose");
const User = require("../model/User");
const { createHmac } = require('node:crypto');
const { request, response } = require('express');

/**
 * Acts as a "ros" subscriber for data from AMD-R
 * @param { request } req
 * @param { response } res
 */
async function subscriber(req, res, next) {
  const { gps, battery, speed, mission } = req.body;
  const model = Mongoose.model(req.id, data, req.id);
  const cTime = new Date();

  if (gps && battery && speed && mission) {
    await model.create({
      gps,
      battery,
      speed,
      mission,
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

/**
 * API for the AMD-Rs to register to the network
 * @param { request } req
 * @param { response } res
 */
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

/**
 * API for verifying the AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function verifyAMDR(req, res, next) {
  const { id } = req.body;
  if (!id)
    return res.status(400).json({ message: "No AMD-R ID given" });
  await amdr.findByIdAndUpdate(id, { verified: true })
    .then((value) => {
      res.status(200).json({
        message: "Succesfully Verified AMD-R",
      })
    })
    .catch((err) => {
      res.status(400).json({
        message: "Unable to Verify AMD-R",
        error: err.message,
      })
    });
}

/**
 * API for getting all the AMD-Rs
 * @param { request } req
 * @param { response } res
 * */
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
      res.status(200).json({ "AMD-Rs": formated });
    })
    .catch((err) => res.status(400).json({
      message: "Failed to fet AMD-Rs",
      error: err.message,
    }))
}

/**
 * API for getting the data of an AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function getAMDRData(req, res, next) {
  const { id } = req.body;
  const model = Mongoose.model(id, data, id);
  const { name } = await amdr.findById(id)
  // https://stackoverflow.com/questions/12467102/how-to-get-the-latest-and-oldest-record-in-mongoose-js-or-just-the-timespan-bet
  model.findOne({}, [], { sort: { Time: -1 } })
    .then(query => {
      // Creating response object
      const container = new Object();
      container.gps = new Object();

      if (query) {
        // Populating values if there is something
        container.gps.lon = Number(query.gps.lon);
        container.gps.lat = Number(query.gps.lat);
        container.mission = query.mission;
        container.battery = Number(query.battery);
        container.speed = Number(query.speed);
        container.name = name;
      } else {
        // Set values to 0 there is nothing
        container.gps.lon = undefined;
        container.gps.lat = undefined;
        container.mission = "Can't fetch any data";
        container.battery = Number(0);
        container.speed = Number(0);
        container.name = name;
      }

      // Responding
      res.status(200).json(container);
    })
    .catch(err => {
      res.status(400).json({
        message: "Unable to get data",
        error: err.message
      });
    });
}

/**
 * API for user authentication for the AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function verifyUser(req, res, next) {
  const { otp, id } = req.body;
  const user = await User.findById(id);
  const interval = 30 * 1000;

  const hmac = createHmac("sha256", user.OTP);
  let time = new Date;
  time = Math.floor((time - new Date(0)) / interval)

  hmac.update(time.toString());
  const digested = hmac.digest().toString('hex');

  if (digested === otp) {
    res.status(201).json({ results: true });
  } else {
    res.status(401).json({ results: false });
  }
}

module.exports = {
  subscriber,
  register,
  getAMDRs,
  verifyAMDR,
  getAMDRData,
  verifyUser,
};
