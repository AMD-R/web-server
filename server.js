const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth, sessionAuth } = require("./middleware/auth.js");
const { port } = require('./config.json');
const { join } = require('node:path');

// Setting View Engines
app.set("view engine", "ejs");

// Connecting to Database
connectDB();

// Middlewares
app.use(express.json());
// https://www.tutorialspoint.com/expressjs/expressjs_form_data.htm (For Serverside authentication)
// https://expressjs.com/en/resources/middleware/body-parser.html#bodyparsertextoptions
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));
app.use("/api/amd-r", require("./amd-r/route"));

// Home Page
app.get("/", (req, res) => res.render("auth/home"));

// Authentication Requests
app.get("/register", sessionAuth, (req, res) => {
  if (req.cookies.redirect) {
    res.clearCookie("redirect");
    res.render("auth/register-failed");
  } else
    res.render("auth/register");
});
app.get("/login", sessionAuth, (req, res) => {
  if (req.cookies.redirect) {
    res.clearCookie("redirect");
    res.render("auth/login-failed");
  } else
    res.render("auth/login");
});
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
app.get("/admin", adminAuth, (req, res) => res.render("auth/admin"));
app.get("/admin/users", adminAuth, (req, res) => res.render("auth/admin-users"));
app.get("/admin/amd-r", adminAuth, (req, res) => res.render("auth/admin-amd-r"));
app.get("/amd-r/*", adminAuth, (req, res) => res.render("amd-r/amd-r"))
app.get("/basic", userAuth, (req, res) => res.render("auth/user"));

// External js, media and css request
// https://www.codespeedy.com/how-to-serve-html-and-css-files-using-express-js/
app.get("/css/*", (req, res) => res.sendFile(join(__dirname, req.path)));
app.get("/js/*", (req, res) => res.sendFile(join(__dirname, req.path)));
app.get("/media/*", (req, res) => res.sendFile(join(__dirname, req.path)));
app.get("*", (req, res) => res.status(404).render('error/404'));

const server = app.listen(port, () =>
  console.log(`Server Connected to port ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
