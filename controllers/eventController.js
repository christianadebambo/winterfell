// Note: An admin user has been manually inserted into the database for initial access. 
// Use the credentials below to access the functionalities of the Alumni Manager (admin):

//     Email address: admin@example.com
//     Password: admin

const validator = require("validator");

/// Formats dates and times for an array of event objects
function formatEventDates(events) {
  return events.map((event) => {
    const eventDate = new Date(event.date);
    event.formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const [hours, minutes] = event.time.split(":");
    event.formattedTime = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      parseInt(hours),
      parseInt(minutes)
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return event;
  });
}

const eventController = {
  // Retrieves and renders the upcoming events
  upcomingEvents: (req, res) => {
    req.eventModel.findUpcomingEvents((err, events) => {
      if (err) {
        console.error(err);
        res.render("events_upcoming", {
          title: "Upcoming Events | Winterfell University Alumni",
          errors: ["Could not retrieve events."],
        });
      } else {
        // Format the dates of the events
        const formattedEvents = formatEventDates(events);
        res.render("events_upcoming", {
          title: "Upcoming Events | Winterfell University Alumni",
          events: formattedEvents,
        });
      }
    });
  },

  // Displays the page for users to choose events to participate in
  participateEvent: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }
    const userId = req.session.user._id.toString();
    req.eventModel.findUpcomingEvents((err, events) => {
      if (err) {
        res.render("event_participate", {
          title: "Participate in Event | Winterfell University Alumni",
          errors: ["Could not retrieve events."],
        });
      } else {
        // Format the dates of the events
        const formattedEvents = formatEventDates(events);
        formattedEvents.forEach((event) => {
          event.isOrganizer = event.organizer === userId;
          event.isParticipant =
            event.participants && event.participants.includes(userId);
        });
        res.render("event_participate", {
          title: "Participate in Event | Winterfell University Alumni",
          events: formattedEvents,
        });
      }
    });
  },

  // Handles the POST request to register a user's participation in an event
  participateEventPost: (req, res) => {
    const eventId = req.body.eventId;
    const userId = req.session.user._id.toString();

    req.eventModel.findEventById(eventId, (err, event) => {
      if (err || !event) {
        console.error(err);
        res.redirect("/participate?error=Event not found");
        return;
      }

      if (
        event.organizer === userId ||
        (event.participants && event.participants.includes(userId))
      ) {
        let errorMessage =
          event.organizer === userId
            ? "You are the organizer of this event"
            : "You are already participating in this event";
        res.redirect(`/participate?error=${errorMessage}`);
        return;
      }

      req.eventModel.addParticipant(eventId, userId, (err, numAffected) => {
        if (err) {
          console.error(err);
          res.redirect("/participate?error=Unable to participate in event");
        } else {
          res.redirect("/myevents");
        }
      });
    });
  },

  // Handles the POST request to remove a user's participation in an event
  removeParticipationPost: (req, res) => {
    const eventId = req.body.eventId;
    const userId = req.session.user._id.toString();

    req.eventModel.removeParticipant(eventId, userId, (err, numAffected) => {
      if (err) {
        console.error(err);
        req.flash("error", "Unable to remove participation in event");
      } else {
        req.flash("success", "You have been removed from the event");
      }
      res.redirect("/myevents");
    });
  },

  // Displays the page for organizing a new event
  organizeEvent: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }
    res.render("event_organize", {
      title: "Organize an Event | Winterfell University Alumni",
    });
  },

  // Handles the POST request to create a new event
  organizeEventPost: (req, res) => {
    // Extract the fields from the request body
    const { title, description, date, category, time, venue, timeZone } =
      req.body;

    if (
      !title ||
      !description ||
      !date ||
      !validator.isISO8601(date) ||
      !category ||
      !time ||
      !venue ||
      !timeZone
    ) {
      req.flash("error", "Please fill in all fields with valid information.");
      res.redirect("/myevents");
      return;
    }

    // Construct the event data
    const eventData = {
      title,
      description,
      date: new Date(date),
      category,
      time,
      venue,
      timeZone,
      organizer: req.session.user._id,
    };

    // Save the new event
    req.eventModel.createEvent(eventData, (err) => {
      if (err) {
        console.error(err);
        req.flash("error", "There was an error saving the event.");
        res.redirect("/organize");
      } else {
        req.flash("success", "Event organized successfully.");
        res.redirect("/myevents");
      }
    });
  },

  // Handles the POST request to update an existing event's details
  updateEventPost: (req, res) => {
    const {
      eventId,
      title,
      description,
      date,
      category,
      time,
      venue,
      timeZone,
    } = req.body;

    if (
      !title ||
      !description ||
      !date ||
      !category ||
      !time ||
      !venue ||
      !timeZone
    ) {
      req.flash("error", "Please fill in all fields.");
      res.redirect(`/edit-event/${eventId}`);
      return;
    }

    const eventData = {
      title,
      description,
      date: new Date(date),
      category,
      time,
      venue,
      timeZone,
    };

    req.eventModel.updateEvent(eventId, eventData, (err) => {
      if (err) {
        console.error(err);
        req.flash("error", "There was an error updating the event.");
        res.redirect(`/edit-event/${eventId}`);
      } else {
        req.flash("success", "Event updated successfully.");
        res.redirect("/myevents");
      }
    });
  },

  // Handles the POST request to cancel an event
  cancelEventPost: (req, res) => {
    const eventId = req.body.eventId;
    const userId = req.session.user._id.toString();

    req.eventModel.findEventById(eventId, (err, event) => {
      if (err || !event) {
        console.error(err);
        req.flash("error", "Event not found");
        res.redirect("/myevents");
        return;
      }

      if (event.organizer !== userId) {
        req.flash("error", "You can only cancel events you are organizing");
        res.redirect("/myevents");
        return;
      }

      req.eventModel.deleteEvent(eventId, (err) => {
        if (err) {
          console.error(err);
          req.flash("error", "Unable to cancel event");
        } else {
          req.flash("success", "Event cancelled successfully");
        }
        res.redirect("/myevents");
      });
    });
  },

  // Retrieves and renders the edit event page with event details
  editEvent: (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.session.user._id.toString();

    req.eventModel.findEventById(eventId, (err, event) => {
      if (err || !event) {
        console.error(err);
        req.flash("error", "Event not found");
        res.redirect("/myevents");
        return;
      }

      if (event.organizer !== userId) {
        req.flash("error", "You can only edit events you are organizing");
        res.redirect("/myevents");
        return;
      }

      // Prepare category flags
      event.isProfessionalCategory = event.category === "professional";
      event.isNetworkingCategory = event.category === "networking";
      event.isSocialCategory = event.category === "social";
      event.isCampusCategory = event.category === "campus";

      // Format the date to YYYY-MM-DD
      event.date = event.date.toISOString().split("T")[0];

      res.render("event_organize", {
        title: "Edit Event | Winterfell University Alumni",
        event: event,
        editing: true,
      });
    });
  },

  // Retrieves and renders the events organized and participated in by the user
  myEvents: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }
    const userId = req.session.user._id;
    req.eventModel.findUserEvents(userId, (err, events) => {
      if (err) {
        console.error(err);
        res.render("my_events", {
          title: "My Events | Winterfell University Alumni",
          errors: ["Could not retrieve your events."],
        });
      } else {
        // Format the dates of the events
        const formattedEvents = formatEventDates(events);
        const organizingEvents = formattedEvents.filter(
          (event) => event.organizer === userId
        );
        const participatingEvents = formattedEvents.filter(
          (event) => event.participants && event.participants.includes(userId)
        );
        res.render("my_events", {
          title: "My Events | Winterfell University Alumni",
          organizingEvents: organizingEvents,
          participatingEvents: participatingEvents,
        });
      }
    });
  },

  // Categorizes and renders upcoming events by their category
  eventCategories: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }
    const userId = req.session.user._id.toString();
    req.eventModel.categorizeUpcomingEvents((err, categories) => {
      if (err) {
        res.render("event_categories", {
          title: "Event Categories | Winterfell University Alumni",
          errors: ["Could not retrieve events."],
        });
      } else {
        Object.keys(categories).forEach((category) => {
          categories[category] = formatEventDates(categories[category]);
          categories[category].forEach((event) => {
            event.isOrganizer = event.organizer === userId;
            event.isParticipant =
              event.participants && event.participants.includes(userId);
          });
        });
        res.render("event_categories", {
          title: "Event Categories | Winterfell University Alumni",
          categories: categories,
        });
      }
    });
  },

  manageEvents: (req, res) => {
    req.eventModel.findUpcomingEvents((err, events) => {
      if (err) {
        req.flash("errors", ["Error fetching events."]);
        res.redirect("/admin/dashboard");
      } else {
        // Format the dates of the events
        const formattedEvents = formatEventDates(events);
        res.render("admin_manage_events", {
          title: "Manage Events | Winterfell University Alumni",
          events: formattedEvents,
          successMessage: req.flash("success"),
          errorMessage: req.flash("errors"),
        });
      }
    });
  },

  cancelEvent: (req, res) => {
    const eventId = req.params.eventId;

    req.eventModel.cancelEvent(eventId, (err) => {
      if (err) {
        req.flash("errors", ["Error deleting event."]);
      } else {
        req.flash("success", "Event deleted successfully.");
      }
      res.redirect("/admin/manage-events");
    });
  },

  // Displays the page for organizing a new event
  displayAddEventForm: (req, res) => {
    res.render("admin_add_event", {
      title: "Add an Event | Winterfell University Alumni",
    });
  },

  // Function to handle the POST request for adding a new event
  addEventPost: (req, res) => {
    // Extract the fields from the request body
    const { title, description, date, category, time, venue, timeZone } =
      req.body;

    if (
      !title ||
      !description ||
      !date ||
      !validator.isISO8601(date) ||
      !category ||
      !time ||
      !venue ||
      !timeZone
    ) {
      req.flash("error", "Please fill in all fields with valid information.");
      res.redirect("/admin/manage-events");
      return;
    }

    // Construct the event data
    const eventData = {
      title,
      description,
      date: new Date(date),
      category,
      time,
      venue,
      timeZone,
      organizer: req.session.user._id,
    };

    // Save the new event
    req.eventModel.createEvent(eventData, (err) => {
      if (err) {
        console.error(err);
        req.flash("error", "There was an error creating the event.");
        res.redirect("/admin/add-event");
      } else {
        req.flash("success", "Event created successfully.");
        res.redirect("/admin/manage-events");
      }
    });
  },

  alumniEvents: (req, res) => {
    req.userModel.findAllUsersExceptAdmin((err, users) => {
      if (err) {
        console.error(err);
        res.redirect("/admin/dashboard");
        return;
      }
      res.render("admin_alumni_events", {
        title: "Alumni Events | Winterfell University Alumni",
        users
      });
    });
  },

  userEvents: (req, res) => {
    const userId = req.params.userId;
    req.userModel.findById(userId, (err, user) => {
      if (err || !user) {
        console.error(err);
        req.flash("error", "User not found.");
        res.redirect("/admin/alumni-events");
        return;
      }
      req.eventModel.findUserEvents(userId, (err, events) => {
        if (err) {
          console.error(err);
          req.flash("error", "Error retrieving events.");
          res.redirect("/admin/alumni-events");
          return;
        }
        const formattedEvents = formatEventDates(events);
        const organizingEvents = formattedEvents.filter(event => event.organizer === userId);
        const participatingEvents = formattedEvents.filter(event => event.participants && event.participants.includes(userId));
        res.render("admin_user_events", { 
          title: `${user.name}'s Events | Winterfell University Alumni`,
          user: user,
          organizingEvents,
          participatingEvents
        });
      });
    });
  },

};

module.exports = eventController;
