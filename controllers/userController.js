const validator = require("validator");

// Define the user controller with its methods
const userController = {
  dashboard: (req, res) => {
    if (!req.session.user) {
      res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.render("dashboard", {
        title: "Dashboard | Winterfell University Alumni",
        user: req.session.user,
      });
    }
  },

  // Renders the user's profile for viewing or editing
  profile: (req, res) => {
    if (!req.session.user) {
      res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      req.userModel.findById(req.session.user._id, (err, user) => {
        if (err || !user) {
          req.flash("errors", ["User not found."]);
          res.redirect("/dashboard");
        } else {
          res.render("profile", {
            title: "Profile | Winterfell University Alumni",
            user: user,
            successMessage: req.flash("success"),
            errorMessage: req.flash("errors"),
          });
        }
      });
    }
  },

  // Handles the updating of user profile information
  updateProfile: (req, res) => {
    const { country, phone, preferredCategory } = req.body;

    const errors = [];

    if (validator.isEmpty(country)) {
      errors.push("Please enter your current country of residence.");
    }

    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      errors.push("Please enter a valid phone number.");
    }

    // Check for any validation errors
    if (errors.length > 0) {
      req.flash("errors", errors);
      res.redirect("/profile");
      return;
    }

    const updateData = {
      country: country,
      phone: phone,
      preferredCategory: preferredCategory,
    };

    req.userModel.updateUser(
      req.session.user._id,
      updateData,
      (err, numAffected) => {
        if (err) {
          req.flash("errors", ["Error updating profile."]);
          res.redirect("/profile");
        } else {
          // Update the user's session information with new profile details
          Object.assign(req.session.user, updateData);
          req.flash("success", "Profile updated successfully.");
          res.redirect("/dashboard");
        }
      }
    );
  },

  // Handles the user registration process
  register: (req, res) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      gradYear,
      prefEventCategory,
    } = req.body;

    const flashErrorsAndRedirect = (errors) => {
      req.flash("errors", errors);
      res.redirect("/register");
    };

    if (!validator.isEmail(email)) {
      flashErrorsAndRedirect(["Please enter a valid email address."]);
      return;
    }

    if (password !== confirmPassword) {
      flashErrorsAndRedirect(["Passwords do not match."]);
      return;
    }

    if (!gradYear || gradYear < 1900 || gradYear > new Date().getFullYear()) {
      flashErrorsAndRedirect(["Please enter a valid graduation year."]);
      return;
    }

    if (!prefEventCategory) {
      flashErrorsAndRedirect(["Please select your preferred event category."]);
      return;
    }

    req.userModel.findOneByEmail(email, (err, user) => {
      if (err) {
        flashErrorsAndRedirect([
          "An error occurred while checking your email.",
        ]);
        return;
      }

      if (user) {
        flashErrorsAndRedirect(["Email is already in use."]);
        return;
      }

      const newUser = {
        name,
        email,
        password,
        gradYear,
        prefEventCategory,
      };

      req.userModel.insertNewUser(newUser, (err, createdUser) => {
        if (err) {
          flashErrorsAndRedirect(["Error registering user."]);
          return;
        }

        req.session.user = createdUser;
        res.redirect("/dashboard");
      });
    });
  },

  // Manages the user login process
  login: (req, res) => {
    const { email, password } = req.body;

    const flashErrorsAndRedirect = (errors) => {
      req.flash("errors", errors);
      res.redirect("/login");
    };

    if (!validator.isEmail(email)) {
      flashErrorsAndRedirect(["Please enter a valid email address."]);
      return;
    }

    req.userModel.findOneByEmail(email, (err, user) => {
      if (err) {
        // Generic error message for database errors
        flashErrorsAndRedirect(["An error occurred, please try again."]);
        return;
      }

      if (!user) {
        // Error message when the email is not found
        flashErrorsAndRedirect(["Invalid email address."]);
        return;
      }

      // Compare the provided password with the hashed password in the database
      req.userModel.comparePassword(
        password,
        user.password,
        (passwordErr, isMatch) => {
          if (passwordErr) {
            // Generic error message for password comparison errors
            flashErrorsAndRedirect(["An error occurred, please try again."]);
            return;
          }

          if (!isMatch) {
            // Error message when the password is incorrect
            flashErrorsAndRedirect(["Invalid password."]);
            return;
          }

          // Regenerate session after successful login
        req.session.regenerate((sessionErr) => {
          if (sessionErr) {
            // Handle session regeneration error
            flashErrorsAndRedirect(["Error in session regeneration. Please try again."]);
            return;
          }

          // Set the user information in the new session
          req.session.user = user;

          // Redirect user based on their role
          if (user && (!user.role || user.role === "alumni")) {
            res.redirect("/dashboard");
          } else if (user.role === "admin") {
            res.redirect("/admin/dashboard");
          }
        });
        }
      );
    });
  },

  // Admin-specific methods
  adminDashboard: (req, res) => {
    res.render("admin_dashboard", {
      title: "Alumni Manager Dashboard | Winterfell University Alumni",
      user: req.session.user,
    });
  },

  manageUsers: (req, res) => {
    req.userModel.db.find({ role: { $ne: "admin" } }, (err, users) => {
      if (err) {
        req.flash("errors", ["Error fetching users."]);
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin_manage_users", {
          title: "Manage Users | Winterfell University Alumni",
          users: users,
          successMessage: req.flash("success"),
          errorMessage: req.flash("errors"),
        });
      }
    });
  },

  addUser: (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.redirect("/login");
    }
    // Render form for adding a new user
    res.render("admin_add_user", {
      title: "Add New User | Winterfell University Alumni",
    });
  },

  addUserPost: (req, res) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      gradYear,
      prefEventCategory,
    } = req.body;

    // Function for redirecting with errors
    const flashErrorsAndRedirect = (errors) => {
      req.flash("errors", errors);
      res.redirect("/admin/add-user");
    };

    // Validation checks
    if (!validator.isEmail(email)) {
      flashErrorsAndRedirect(["Please enter a valid email address."]);
      return;
    }
    if (password !== confirmPassword) {
      flashErrorsAndRedirect(["Passwords do not match."]);
      return;
    }
    if (!gradYear || gradYear < 1900 || gradYear > new Date().getFullYear()) {
      flashErrorsAndRedirect(["Please enter a valid graduation year."]);
      return;
    }
    if (!prefEventCategory) {
      flashErrorsAndRedirect(["Please select a preferred event category."]);
      return;
    }

    // Check for existing user with the same email
    req.userModel.findOneByEmail(email, (err, existingUser) => {
      if (err) {
        flashErrorsAndRedirect(["Error checking for existing user."]);
        return;
      }
      if (existingUser) {
        flashErrorsAndRedirect(["Email is already in use."]);
        return;
      }

      // Create new user object
      const newUser = {
        name,
        email,
        password, 
        gradYear,
        prefEventCategory,
      };

      // Insert the new user into the database
      req.userModel.insertNewUser(newUser, (insertErr, createdUser) => {
        if (insertErr) {
          flashErrorsAndRedirect(["Error adding new user."]);
          return;
        }
        req.flash("success", "New user added successfully.");
        res.redirect("/admin/manage-users");
      });
    });
  },

  // Display edit user form
  displayEditUserForm: (req, res) => {
    const userId = req.params.userId;
    req.userModel.findById(userId, (err, user) => {
      if (err || !user) {
        req.flash("errors", ["User not found."]);
        res.redirect("/admin/manage-users");
      } else {
        res.render("admin_edit_user", {
          title: "Edit User | Winterfell University Alumni",
          user: user,
        });
      }
    });
  },

  // Handle edit user form submission
  editUserPost: (req, res) => {
    const userId = req.params.userId;
    const { name, email, gradYear, prefEventCategory } = req.body;

    // Validation logic
    const errors = [];
    if (validator.isEmpty(name)) {
      errors.push("Name cannot be empty.");
    }
    if (!validator.isEmail(email)) {
      errors.push("Invalid email format.");
    }
    if (gradYear && (gradYear < 1900 || gradYear > new Date().getFullYear())) {
      errors.push("Invalid graduation year.");
    }
    if (!prefEventCategory) {
      errors.push("Please select a preferred event category.");
    }

    // Check for any validation errors
    if (errors.length > 0) {
      req.flash("errors", errors);
      res.redirect(`/admin/edit-user/${userId}`);
      return;
    }

    // Data for updating the user
    const updateData = {
      name,
      email,
      gradYear,
      prefEventCategory,
    };

    // Update user in the database
    req.userModel.updateUser(userId, updateData, (err, numAffected) => {
      if (err) {
        req.flash("errors", ["Error updating user."]);
        res.redirect(`/admin/edit-user/${userId}`);
      } else {
        req.flash("success", "User updated successfully.");
        res.redirect("/admin/manage-users");
      }
    });
  },

  deleteAlumni: (req, res) => {
    const userId = req.params.userId;

    req.userModel.deleteUser(userId, (err) => {
      if (err) {
        req.flash("errors", ["Error deleting alumni record."]);
      } else {
        req.flash("success", "Alumni record deleted successfully.");
      }
      res.redirect("/admin/manage-users");
    });
  },
};

module.exports = userController;
