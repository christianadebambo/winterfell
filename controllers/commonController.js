// Common controller object holding methods for handling general routes
const TITLE_PREFIX = 'Winterfell University Alumni';

const commonController = {
  // Renders the homepage view
  home: (req, res) => {
    // The render function takes the name of the view and the context object that defines the variables to be used in the view.
    res.render('home', { title: `Welcome | ${TITLE_PREFIX}` });
  },

  // Renders the about page view
  about: (req, res) => {
    res.render('about', { title: `About Us | ${TITLE_PREFIX}` });
  },

  // Renders the login page view
  login: (req, res) => {
    res.render('login', { title: `Login | ${TITLE_PREFIX}` });
  },

  // Renders the registration page view
  register: (req, res) => {
    res.render('register', { title: `Register | ${TITLE_PREFIX}` });
  },

  // Handles the logout process by destroying the user session
  logout: (req, res) => {
    // req.session.destroy initiates the destruction of the session
    req.session.destroy(err => {
      // Error handling in case the session destruction fails
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Error logging out');
      }
      // Redirects to the home page after successful logout
      res.redirect('/');
    });
  }  
};

module.exports = commonController;