#!/usr/bin/env node

const express = require('express');
const router = express.Router();

const { adminAuthAPI } = require('../middleware/auth');
const { subscriber, register, getAMDRs, verifyAMDR, getAMDRData, verifyUser, verified } = require('./amd-r');

router.route('/subscriber').post(subscriber);
router.route('/register').post(register);
router.route('/getAMD-Rs').get(adminAuthAPI, getAMDRs);
router.route('/verifyAMD-R').patch(adminAuthAPI, verifyAMDR);
router.route('/getData').get(adminAuthAPI, getAMDRData);
router.route('/verifyUser').post(verifyUser);
router.route('/test-verification').post(verified);

module.exports = router;
