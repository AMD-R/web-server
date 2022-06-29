const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
const { port } = require('./config.json');

app.set("view engine", "ejs");

connectDB();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));

app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
app.get("/admin", adminAuth, (req, res) => res.render("admin"));
app.get("/basic", userAuth, (req, res) => {
  res.render("user");
});
app.get("*", (req, res) => res.status(404).render('404'));

const server = app.listen(port, () =>
  console.log(`Server Connected to port ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
