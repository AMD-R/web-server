#!/usr/bin/env node

const express = require("express");
const router = express.Router();

const { amdrAuthAPI, adminAuthAPI } = require("../middleware/auth");
const { subscriber, register, getAMDRs, verifyAMDR } = require("./amd-r");

router.route('/subscriber').post(amdrAuthAPI, subscriber);
router.route('/register').post(register);
router.route('/getAMDRs').get(getAMDRs);
router.route('/verifyAMD-R').patch(adminAuthAPI, verifyAMDR);

module.exports = router;
