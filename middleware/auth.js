const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../config.json');
const amdr = require('../model/AMD-R');
const bcrypt = require("bcryptjs");
const { request, response } = require('express');


// Normal middleware
/**
 * Check if the user logged in is an admin
 * @param {request} req
 * @param {response} res
 * */
exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).render('error/401');
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).render('error/401');
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .render('error/401');
  }
};
/**
 * Check if the user logged in is a normal user
 * @param {request} req
 * @param {response} res
 * */
exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).render('error/401');
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).render('error/401');
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .render('error/401');
  }
};
/**
 * Check if the user logged in
 * @param {request} req
 * @param {response} res
 * */
exports.sessionAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(400).render('error/400');
      } else {
        if (decodedToken.role == "Basic") {
          return res.status(303).redirect('/basic');
        } else if (decodedToken.role == "admin"){
          return res.status(303).redirect('/admin');
        } else {
          return res.render('auth/login-failed');
        }
      }
    });
  } else {
    next();
  }
}

// API middleware
/**
 * Check if the user logged in is an admin (API version)
 * @param {request} req
 * @param {response} res
 * */
exports.adminAuthAPI = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({message: 'Permissions Denied'});
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).json({message: 'Permissions Denied'});
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .json({message: 'Permissions Denied'});
  }
};
/**
 * Check if the user logged in is a normal user (API version)
 * @param {request} req
 * @param {response} res
 * */
exports.userAuthAPI = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({message: 'Permissions Denied'});
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({message: 'Permissions Denied'});
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .json({message: 'Permissions Denied'});
  }
};
