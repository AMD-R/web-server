#!/usr/bin/env node

const express = require("express");
const router = express.Router();

const { amdrAuthAPI, adminAuthAPI } = require("../middleware/auth");
const { subscriber, register, getAMDRs, verifyAMDR, getAMDRData } = require("./amd-r");

router.route('/subscriber').post(amdrAuthAPI, subscriber);
router.route('/register').post(register);
router.route('/getAMD-Rs').get(adminAuthAPI, getAMDRs);
router.route('/verifyAMD-R').patch(adminAuthAPI, verifyAMDR);
router.route('/getData').post(adminAuthAPI, getAMDRData);

module.exports = router;
