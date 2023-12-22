// Note: An admin user has been manually inserted into the database for initial access. 
// Use the credentials below to access the functionalities of the Alumni Manager (admin):

//     Email address: admin@example.com
//     Password: admin

const bcrypt = require('bcrypt');
const saltRounds = 10;

// UserModel class definition to handle user-related database operations
class UserModel {
  // Constructor initializing with a NeDB database instance
  constructor(db) {
    this.db = db;
  }

  // Finds a single user by their email address
  findOneByEmail(email, callback) {
    // Log the start of the operation
    console.log('Finding a user by email:', email);
    // Query the database for a user with the given email
    this.db.findOne({ email: email }, (err, doc) => {
      // Log any errors or the found user
      if (err) {
        console.error('Error finding user by email:', err);
      } else {
        console.log('User found:', doc);
      }
      // Execute the callback with error (if any) and the found document
      callback(err, doc);
    });
  }

  // Finds a user by their unique identifier
  findById(id, callback) {
    // Log the start of the operation
    console.log('Finding a user by ID:', id);
    // Query the database for a user with the given _id
    this.db.findOne({ _id: id }, (err, doc) => {
      // Log any errors or the found user
      if (err) {
        console.error('Error finding user by ID:', err);
      } else {
        console.log('User found:', doc);
      }
      // Execute the callback with error (if any) and the found document
      callback(err, doc);
    });
  }

  // Updates the user data for a given user identifier
  updateUser(id, updateData, callback) {
    // Log the attempt to update a user
    console.log('Updating user:', id, 'with data:', updateData);
    // Update the user document with the new data
    this.db.update({ _id: id }, { $set: updateData }, {}, (err, numAffected, affectedDocuments, upsert) => {
      // Log the outcome of the update operation
      if (err) {
        console.error('Error updating user:', err);
      } else {
        console.log('User updated successfully. Number of documents affected:', numAffected);
      }
      // Execute the callback with the error (if any) and the updated documents
      callback(err, affectedDocuments);
    });
  }

  // Hash password before inserting a new user
  insertNewUser(userData, callback) {
    bcrypt.hash(userData.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        // If there's an error hashing the password, pass the error to the callback
        callback(err, null);
      } else {
        // If hashing is successful, replace the plain text password with the hash
        userData.password = hash;

        // Insert the new user with the hashed password into the database
        this.db.insert(userData, (insertErr, newDoc) => {
          if (insertErr) {
            // If there's an error inserting the new user, pass the error to the callback
            console.error('Error inserting new user:', insertErr);
            callback(insertErr, null);
          } else {
            // If insertion is successful, pass the new document to the callback
            console.log('New user inserted:', newDoc);
            callback(null, newDoc);
          }
        });
      }
    });
  }

  comparePassword(candidatePassword, hashedPassword, callback) {
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
      console.log(`Comparing password: ${candidatePassword} with hash: ${hashedPassword}, result: ${isMatch}`);
      if (err) {
        callback(err, false);
      } else {
        callback(null, isMatch);
      }
    });
  }
  

  deleteUser(id, callback) {
    this.db.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) {
        console.error(`Error deleting user ${id}:`, err);
        callback(err);
      } else {
        console.log(`User deleted ${id}:`, numRemoved);
        callback(null, numRemoved);
      }
    });
  }

  // Retrieves all users except those with the 'admin' role
  findAllUsersExceptAdmin(callback) {
    // Log the start of the operation
    console.log('Retrieving all users except admin');
    // Query the database for all users except those with 'admin' role
    this.db.find({ role: { $ne: 'admin' } }, (err, docs) => {
      // Log any errors or the found users
      if (err) {
        console.error('Error retrieving all users except admin:', err);
        callback(err, null);
      } else {
        console.log('Non-admin users retrieved:', docs.length);
        callback(null, docs);
      }
    });
  }
  
}

module.exports = UserModel;
