# Winterfell University Alumni Platform

The Winterfell University Alumni Platform is a comprehensive web application designed for facilitating interaction and engagement among alumni of Winterfell University. This system allows alumni to participate in events, update personal profiles, and engage with the alumni community. It features a separate admin panel for managing users and events, including specialized functionalities for an Alumni Manager.

**Note:** An admin user has been manually inserted into the database for initial access. Use the credentials below to access the functionalities of the Alumni Manager (admin):
- **Email address:** admin@example.com
- **Password:** admin

## Code Overview

### Imports and Dependencies
- The application uses `Node.js` and `Express` for server-side logic.
- `NeDB`, a lightweight JavaScript database, is used for data storage.
- `Mustache-Express` is employed as the template engine for rendering views.
- Additional libraries like `body-parser`, `express-session`, and `connect-flash` enhance functionality for parsing request bodies, managing sessions, and flashing messages.

### Database Initialization
- Initializes two NeDB databases, one for users and another for events.

### User and Event Models
- Models for users (`UserModel`) and events (`EventModel`) encapsulate database operations.

### Middleware
- Implements custom middleware for session handling, user and event model availability, and static file serving.

### Authentication
- Manages user authentication using `express-session`.
- Passwords are hashed using `bcrypt` for enhanced security.

### Routes
- Defines routes for common functionalities, user actions, and admin actions.
- Admin-specific routes provide functionalities like managing users, events, and viewing alumni event participation.

### Admin Dashboard
- An admin dashboard is available for the Alumni Manager to oversee all activities, including event management and user records.

### User Interaction
- Alumni can register, log in, update profiles, and participate in events.
- Users can view, organize, and participate in upcoming events, categorized by their nature (professional, networking, etc.).

### Event Management
- Supports creation, editing, and deletion of events by users and the admin.
- The system facilitates viewing all events, events by category, and individual event details.

## Installation and Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/christianadebambo/winterfell.git

2. **Navigate to the project directory:**
   ```bash
   cd winterfell

## Requirements
- Requires Node.js and npm installation.
- Install necessary Node modules:
  ```bash
   npm install

## Usage
1. **Start the application:**
   ```bash
   node server.js

2. **Access the application:**
   ```bash
   Open a web browser and visit `http://localhost:3000`.
