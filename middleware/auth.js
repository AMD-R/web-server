const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../config.json');

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
