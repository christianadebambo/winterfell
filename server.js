require('dotenv').config();

const express = require("express");
const session = require("express-session");
const mustacheExpress = require("mustache-express");
const path = require("path");
const NeDB = require("nedb");
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const flash = require('connect-flash');
const portfinder = require('portfinder');
const EventModel = require('./models/EventModel');
const UserModel = require('./models/UserModel');
const isAdmin = require('./middlewares/isAdmin'); // Import the isAdmin middleware

// Set up an instance of express for our app
const app = express();

// Create a database object and initialize databases for users and events using NeDB
const db = {};
db.users = new NeDB({
  filename: path.join(__dirname, "data", "users.db"),
  autoload: true, // Automatically load the database
});
db.events = new NeDB({
  filename: path.join(__dirname, "data", "events.db"),
  autoload: true,
});

// Instantiate models with the database instances
const eventModel = new EventModel(db.events);
const userModel = new UserModel(db.users);

// Middleware to add the event model to every request
app.use((req, res, next) => {
  req.eventModel = eventModel;
  next();
});

// Middleware to add the user model to every request
app.use((req, res, next) => {
  req.userModel = userModel;
  next();
});

// Configure session handling with express-session
app.use(session({
  secret: "rAnDoMdEv",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 60 * 1000, // 10 minutes
    httpOnly: true, // Prevents clientside JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production' 
  }
}));

// Configure the mustache template engine for server-side rendering
app.engine(
  "mustache",
  mustacheExpress(path.join(__dirname, "views", "partials"), ".mustache")
);
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// Use body-parser to parse URL-encoded bodies and JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up flash middleware to enable passing temporary messages to views
app.use(flash());

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});


// Middleware to make the database instances available to the router
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Import routes for different parts of the application
const commonRoutes = require("./routes/commonRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Register the imported routes with the application
app.use(commonRoutes);
app.use(eventRoutes);
app.use(userRoutes);

// Admin-only routes protected by isAdmin middleware
app.use('/admin', isAdmin, adminRoutes); // Apply isAdmin middleware to all admin routes

const preferredPort = 3000;

portfinder.basePort = preferredPort; // start searching from preferredPort

portfinder.getPort((err, port) => {
  if (err) {
    console.error(err);
    return;
  }

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

module.exports = app;
