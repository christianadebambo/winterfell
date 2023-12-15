const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const logRequest = (req, res, next) => {
  console.log(`[UserRoutes] Received request for ${req.method} ${req.url}`);
  next(); // Ensure continuation to the next middleware or route handler.
};

// Apply the logging middleware to all routes in this router to provide a consistent logging mechanism.
router.use(logRequest);

// Route for user's dashboard, accessible after successful authentication.
router.route('/dashboard')
  .get(userController.dashboard); // GET request to display the dashboard.

// Routes related to the user's profile.
router.route('/profile')
  .get(userController.profile) // GET request to view user profile.
  .post(userController.updateProfile); // POST request to update user profile.

// Route for user registration.
router.route('/register')
  .post(userController.register); // POST request to handle new user registrations.

// Route for user login.
router.route('/login')
  .post(userController.login); // POST request to authenticate a user and start a session.

router.use((err, req, res, next) => {
  console.error(`[UserRoutes] ${err.stack}`); 
  res.status(500).send('Something went wrong with the user operation!'); 
});

module.exports = router; 
