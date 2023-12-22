// Note: An admin user has been manually inserted into the database for initial access. 
// Use the credentials below to access the functionalities of the Alumni Manager (admin):

//     Email address: admin@example.com
//     Password: admin

// EventModel class definition to handle event-related database operations
class EventModel {
  // Constructor initializing with a NeDB database instance
  constructor(db) {
    this.db = db;
  }

  // Retrieves all events that are scheduled to occur after the current date
  findUpcomingEvents(callback) {
    const now = new Date();
    // Query the database for events where the date is greater than or equal to the current date
    this.db
      .find({ date: { $gte: now } })
      .sort({ date: 1 }) // Sort the results in ascending order by date
      .exec((err, events) => { // Execute the query
        // Handle errors or pass the found events to the callback
        if (err) {
          console.error('Error finding upcoming events:', err);
          callback(err);
        } else {
          console.log('Upcoming events found:', events);
          callback(null, events);
        }
      });
  }

  // Finds a single event by its unique identifier
  findEventById(eventId, callback) {
    // Query the database for an event with the given _id
    this.db.findOne({ _id: eventId }, (err, event) => {
      // Handle errors or pass the found event to the callback
      if (err) {
        console.error(`Error finding event by ID ${eventId}:`, err);
        callback(err);
      } else {
        console.log(`Event found by ID ${eventId}:`, event);
        callback(null, event);
      }
    });
  }

  // Adds a user to an event's list of participants
  addParticipant(eventId, userId, callback) {
    // Update the event's participants array by adding the userId using $addToSet to prevent duplicates
    this.db.update(
      { _id: eventId },
      { $addToSet: { participants: userId } },
      {},
      (err, numAffected) => {
        // Handle errors or pass the result to the callback
        if (err) {
          console.error(`Error adding participant to event ${eventId}:`, err);
          callback(err);
        } else {
          console.log(`Added participant ${userId} to event ${eventId}:`, numAffected);
          callback(null, numAffected);
        }
      }
    );
  }

  // Removes a user from an event's list of participants
  removeParticipant(eventId, userId, callback) {
    // Update the event's participants array by removing the userId using $pull
    this.db.update(
      { _id: eventId },
      { $pull: { participants: userId } },
      {},
      (err, numAffected) => {
        // Handle errors or pass the result to the callback
        if (err) {
          console.error(`Error removing participant from event ${eventId}:`, err);
          callback(err);
        } else {
          console.log(`Removed participant ${userId} from event ${eventId}:`, numAffected);
          callback(null, numAffected);
        }
      }
    );
  }

  // Creates a new event with the provided event data
  createEvent(eventData, callback) {
    // Insert the new event data into the database
    this.db.insert(eventData, (err, newEvent) => {
      // Handle errors or pass the new event to the callback
      if (err) {
        console.error('Error creating event:', err);
        callback(err);
      } else {
        console.log('Event created:', newEvent);
        callback(null, newEvent);
      }
    });
  }

  // Deletes an event based on its unique identifier
  deleteEvent(eventId, callback) {
    // Remove the event from the database using its _id
    this.db.remove({ _id: eventId }, {}, (err, numRemoved) => {
      // Handle errors or pass the result to the callback
      if (err) {
        console.error(`Error deleting event ${eventId}:`, err);
        callback(err);
      } else {
        console.log(`Event deleted ${eventId}:`, numRemoved);
        callback(null, numRemoved);
      }
    });
  }

  // Updates an existing event with new data
  updateEvent(eventId, eventData, callback) {
    // Update the event in the database with the provided data
    this.db.update({ _id: eventId }, { $set: eventData }, {}, (err, numAffected) => {
      // Handle errors or pass the result to the callback
      if (err) {
        console.error(`Error updating event ${eventId}:`, err);
        callback(err);
      } else {
        console.log(`Event updated ${eventId}:`, numAffected);
        callback(null, numAffected);
      }
    });
  }  

  // Finds all events where the user is either the organizer or a participant
  findUserEvents(userId, callback) {
    // Query the database for events matching the user as organizer or participant
    this.db
      .find({ $or: [{ organizer: userId }, { participants: userId }] })
      .exec((err, events) => {
        // Handle errors or pass the found events to the callback
        if (err) {
          console.error(`Error finding events for user ${userId}:`, err);
          callback(err);
        } else {
          console.log(`Events found for user ${userId}:`, events);
          callback(null, events);
        }
      });
  }

  // Categorizes upcoming events by their type
  categorizeUpcomingEvents(callback) {
    const now = new Date();
    // Query the database for upcoming events
    this.db.find({ date: { $gte: now } }).exec((err, events) => {
      // Handle errors early
      if (err) {
        console.error('Error categorizing upcoming events:', err);
        callback(err);
        return;
      }
      // Categorize events based on the category field
      let categories = {
        professional: [],
        networking: [],
        social: [],
        campus: [],
      };
      // Assign events to their respective categories
      events.forEach((event) => {
        if (event.category in categories) {
          categories[event.category].push(event);
        }
      });
      console.log('Categorized upcoming events:', categories);
      callback(null, categories);
    });
  }

  cancelEvent(eventId, callback) {
    this.db.remove({ _id: eventId }, {}, (err, numRemoved) => {
      if (err) {
        console.error(`Error deleting event ${eventId}:`, err);
        callback(err);
      } else {
        console.log(`Event deleted ${eventId}:`, numRemoved);
        callback(null, numRemoved);
      }
    });
  }

}

module.exports = EventModel;
