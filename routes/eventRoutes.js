const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const logRequest = (req, res, next) => {
  console.log(`[EventRoutes] Received request for ${req.method} ${req.url}`);
  next(); // Continues to the next middleware or route handler.
};

// Apply the logging middleware to all routes in this router for monitoring purposes.
router.use(logRequest);

// Handles requests for upcoming events.
router.route('/upcoming')
  .get(eventController.upcomingEvents); // GET to list upcoming events.

// Handles requests to participate in an event.
router.route('/participate')
  .get(eventController.participateEvent) // GET to show participation page.
  .post(eventController.participateEventPost); // POST to submit participation in an event.

// Handles requests for organizing a new event.
router.route('/organize')
  .get(eventController.organizeEvent) // GET to show the organize event page.
  .post(eventController.organizeEventPost); // POST to submit a new event.

// Handles requests to view the user's events.
router.route('/myevents')
  .get(eventController.myEvents); // GET to list the user's events.

// Handles requests to view events by categories.
router.route('/categories')
  .get(eventController.eventCategories); // GET to show events categorized.

// Handles requests to edit an existing event.
router.route('/edit-event/:eventId')
  .get(eventController.editEvent); // GET to show the edit event page with form pre-filled.

router.post('/remove-participation', eventController.removeParticipationPost); // Handles removing user participation from an event.
router.post('/cancel-event', eventController.cancelEventPost); // Handles cancellation of an event by the organizer.
router.post('/update-event', eventController.updateEventPost); // Handles updates to event details.

router.use((err, req, res, next) => {
  console.error(`[EventRoutes] ${err.stack}`); 
  res.status(500).send('Something went wrong with the event operation!'); 
});

module.exports = router; 
