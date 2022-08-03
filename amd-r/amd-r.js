#!/usr/bin/env node
const data = require('../model/amd-r-data');
const amdr = require('../model/AMD-R');
const Mongoose = require('mongoose');
const User = require('../model/User');
const { createHmac, verify, createPublicKey } = require('node:crypto');
const { request, response } = require('express');

/**
 * Acts as a 'ros' subscriber for data from AMD-R
 * @param { request } req
 * @param { response } res
 */
async function subscriber(req, res) {
  const { signature, name } = req.body;
  const amd_r_data = req.body.data;
  // Checking if there is a signature
  if (!signature) {
    return res.status(401).json({ message: 'No message signature given' });
  }

  // Getting user id and public key
  let id;
  let key;
  try {
    const user = await amdr.findOne({ name });
    id = user._id.toString();
    key = user.key;
    if (!user.verified) {
      return res.status(401).json({
        message: 'AMD-R not verified.',
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: 'An error occurred',
      error: error.message,
    });
  }
  // Creating model
  const model = Mongoose.model(id, data, id);

  // Checking all the message data
  if (amd_r_data) {
    const message = amd_r_data;
    const { gps, battery, speed, mission, Time } = JSON.parse(amd_r_data);

    // Getting key
    const keyOptions = {
      key: key,
      type: 'spki',
      format: 'pem',
      encoding: 'utf-8',
    };
    const publicKey = createPublicKey(keyOptions);

    // Verifying message
    const verification = verify(null, message, publicKey, Buffer.from(signature, 'hex'));
    if (!verification) {
      return res.status(401).json({
        message: 'Invalid message signature',
      });
    }

    // Writing data
    await model.create({
      gps,
      battery,
      speed,
      mission,
      Time,
    })
      .then(() => {
        res.status(200).json({
          message: 'Succesfully Recieved AMD-R data',
          time: Time,
          name: req.name,
        });
      })
      .catch((err) => {
        res.status(400).json({
          message: 'Data updating failed',
          error: err.message,
        });
      });
  } else {
    // Data incomplete
    return res.status(400).json({ message: 'Not enough data given' });
  }
}

/**
 * API for the AMD-Rs to register to the network
 * @param { request } req
 * @param { response } res
 */
async function register(req, res) {
  const { name, key } = req.body;

  await amdr.create({
    name,
    verified: false,
    key,
  })
    .then((user) => {
      res.status(201).json({
        message: 'AMD-R successfully registered',
        id: user._id,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: 'AMD-R registration failed',
        error: error.message,
      });
    });
}

/**
 * API for verifying the AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function verifyAMDR(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'No AMD-R ID given' });
  }
  await amdr.findByIdAndUpdate(id, { verified: true })
    .then(() => {
      res.status(200).json({
        message: 'Succesfully Verified AMD-R',
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: 'Unable to Verify AMD-R',
        error: err.message,
      });
    });
}

/**
 * API for getting all the AMD-Rs
 * @param { request } req
 * @param { response } res
 * */
async function getAMDRs(req, res) {
  await amdr.find({})
    .then((amdrs) => {
      const formated = amdrs.map((map_amdr) => {
        const container = new Object;
        container.name = map_amdr.name;
        container.id = map_amdr._id;
        container.verified = map_amdr.verified;

        return container;
      });
      res.status(200).json({ 'AMD-Rs': formated });
    })
    .catch((err) => res.status(400).json({
      message: 'Failed to fet AMD-Rs',
      error: err.message,
    }));
}

/**
 * API for getting the data of an AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function getAMDRData(req, res) {
  const { id } = req.query;
  let model, name;
  // Getting data and creating model for AMD-R
  try {
    name = await (await amdr.findById(id)).name;
    model = Mongoose.model(id, data, id);
  } catch {
    return res.status(400).json({ message: 'AMD-R not found' });
  }
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
        container.mission = 'Can\'t fetch any data';
        container.battery = Number(0);
        container.speed = Number(0);
        container.name = name;
      }

      // Responding
      res.status(200).json(container);
    })
    .catch(err => {
      res.status(400).json({
        message: 'Unable to get data',
        error: err.message,
      });
    });
}

/**
 * API for user authentication for the AMD-R
 * @param { request } req
 * @param { response } res
 * */
async function verifyUser(req, res) {
  const { otp, id } = req.body;
  const user = await User.findById(id);
  const interval = 30 * 1000;

  if (!user) {
    return res.status(400).json({ message: 'Invalid User' });
  }

  const hmac = createHmac('sha256', user.OTP);
  let time = new Date;
  time = Math.floor((time - new Date(0)) / interval);

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
