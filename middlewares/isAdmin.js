// isAdmin.js

function isAdmin(req, res, next) {
    // Check if the user is logged in and has an admin role
    if (req.session.user && req.session.user.role === 'admin') {
      return next(); // User is an admin, proceed to the next middleware
    } else if (!req.session.user) {
      return res.redirect('/login');
    } else {
      return res.redirect('/dashboard')
    }
  }
  
  module.exports = isAdmin;
  