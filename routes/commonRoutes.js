const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

const logRequest = (req, res, next) => {
  console.log(`Received request for ${req.method} ${req.url}`);
  next(); // Ensures the middleware chain continues to process the request.
};

// Apply the logging middleware to all routes in this router.
router.use(logRequest);


router.get('/', commonController.home)        // Handles GET requests for the homepage.
      .get('/about', commonController.about)  // Handles GET requests for the about page.
      .get('/login', commonController.login)  // Handles GET requests for the login page.
      .get('/register', commonController.register)  // Handles GET requests for the registration page.
      .get('/logout', commonController.logout);    // Handles GET requests to perform user logout.


router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!'); 
});

module.exports = router; 
