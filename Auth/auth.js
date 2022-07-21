const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../config.json');
const { request, response } = require('express');
const { generateKey, createHmac } = require('node:crypto');

if (!jwtSecret) {
  console.log('No jwtSecret found, generating...Please don\'t terminate process');

  // Getting required modules
  const crypto = require('node:crypto');
  const fs = require('node:fs');
  var config = require('../config.json');

  // Generating and writing
  config.jwtSecret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

  // Success and exit
  console.log('Succesfully generated jwtSecret, please restart program');
  process.exit(0);
}

/**
 * API for registering
 * @param {request} req
 * @param {response} res
 * */
exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  const key = new Promise((resolve, reject) => {
    generateKey("hmac", { length: 256 }, (err, key) => {
      if (err) {
        res.cookie("redirect", "Error");
        res.status(400).redirect('/register');
      }
      resolve(key.export().toString('hex'));
    });
  })

  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      OTP: await key,
    })
      .then((user) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          { id: user._id, username, role: user.role },
          jwtSecret,
          {
            expiresIn: maxAge, // 3hrs
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        res.status(201).redirect("/basic");
      })
      .catch((error) => {
        res.cookie("redirect", "Duplicate Username");
        res.status(400).redirect("/register");
      });
  });
};

/**
 * API for loggingin
 * @param {request} req
 * @param {response} res
 * */
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password is provided
  if (!username || !password) {
    res.cookie("redirect", "Incorrect Username or Password");
    return res.status(400).redirect("/login");
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.cookie("redirect", "Incorrect Username or Password");
      return res.status(400).redirect("/login");
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function(result) {
        if (result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, username, role: user.role },
            jwtSecret,
            {
              expiresIn: maxAge, // 3hrs in sec
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
          if (user.role == "admin") {
            res.status(201).redirect("/admin");
          } else if (user.role == "Basic") {
            res.status(201).redirect("/basic");
          } else {
            res.cookie("redirect", "Invalid Role");
            res.status(400).redirect("/login");
          }
        } else {
          res.cookie("redirect", "Incorrect Username or Password");
          res.status(400).redirect("/login");
        }
      });
    }
  } catch (error) {
    res.status(400).redirect("/login");
  }
};

/**
 * API for updating a user's role
 * @param {request} req
 * @param {response} res
 * */
exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      // Finds the user with the id
      await User.findById(id)
        .then((user) => {
          // Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;
            user.save((err) => {
              //Monogodb error checker
              if (err) {
                return res
                  .status(400)
                  .json({ message: "An error occurred", error: err.message });
                process.exit(1);
              }
              res.status(201).json({ message: "Update successful", user });
            });
          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res
            .status(400)
            .json({ message: "An error occurred", error: error.message });
        });
    } else {
      res.status(400).json({
        message: "Role is not admin",
      });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};

/**
 * API for deleting a user
 * @param {request} req
 * @param {response} res
 * */
exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => user.remove())
    .then((user) =>
      res.status(201).json({ message: "User successfully deleted", user })
    )
    .catch((error) =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    );
};

/**
 * API for getting all the users
 * @param {request} req
 * @param {response} res
 * */
exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        container.role = user.role;
        container.id = user._id;

        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};

/**
 * API for getting OTP
 * @param {request} req
 * @param {response} res
 * */
exports.getOTP = async (req, res, next) => {
  const token = req.cookies.jwt;
  const interval = 30 * 1000;
  // If there is token
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      // If there is a problem verifying token
      if (err) {
        return res.status(401).render('error/401');
      } else {
        // Everything good
        User.findById(decodedToken.id)
          .then((user) => { // If user found
            const hmac = createHmac("sha256", user.OTP);
            let time = new Date;
            time = Math.floor((time - new Date(0)) / interval)

            hmac.update(time.toString());
            const digested = hmac.digest().toString('hex');
            res.status(200).json({ otp: digested, id: decodedToken.id });
          })
          .catch((err) => // Error finding user
            res.status(401).json({ message: "Not successful", error: err.message })
          );
      }
    });
  } else { // No token
    return res
      .status(401)
      .render('error/401');
  }
}
