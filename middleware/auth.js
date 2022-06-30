const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../config.json');

// Normal middleware
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

// API middleware
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
