const express = require('express');
const router = express.Router();

const { register, login, update, deleteUser, getUsers, getOTP } = require('./auth');
const { adminAuthAPI, userAuthAPI } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/update').put(adminAuthAPI, update);
router.route('/deleteUser').delete(adminAuthAPI, deleteUser);
router.route('/getUsers').get(getUsers);
router.route('/getOTP').get(userAuthAPI, getOTP);

module.exports = router;
