const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');


// Middleware to log admin route requests
const logRequest = (req, res, next) => {
  console.log(`[AdminRoutes] Received request for ${req.method} ${req.url}`);
  next();
};

// Apply the logging middleware to all admin routes
router.use(logRequest);

// Admin Dashboard
router.get('/dashboard', userController.adminDashboard);

// Manage Users
router.get('/manage-users', userController.manageUsers);

// Route for displaying the add user form
router.get('/add-user', userController.addUser);

// Route for handling the submission of the add user form
router.post('/add-user', userController.addUserPost);

// Route to display the edit user form
router.get('/edit-user/:userId', userController.displayEditUserForm);

// Route to handle the edit user form submission
router.post('/edit-user/:userId', userController.editUserPost);

router.get('/delete-user/:userId', userController.deleteAlumni);

// Manage Events
router.get('/manage-events', eventController.manageEvents);

// Route to cancel a new event
router.get('/delete-event/:eventId', eventController.cancelEvent);

// Route to display the form to add a new event
router.get('/add-event', eventController.displayAddEventForm);

// Route to handle the submission of the new event form
router.post('/add-event', eventController.addEventPost);

// Route for the Alumni Events page
router.get('/alumni-events', eventController.alumniEvents);

router.get('/user-events/:userId', eventController.userEvents);

// Error handling middleware for admin routes
router.use((err, req, res, next) => {
  console.error(`[AdminRoutes] ${err.stack}`);
  res.status(500).send('Something went wrong with the admin operation!');
});

module.exports = router;
