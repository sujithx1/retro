# Expo Integration & API Changes

This document outlines the API changes implemented in the backend server to support the Expo client app via the `platform: expo` header.

## Overview of Changes

To allow the React Native Expo app to reuse existing backend routes designed for EJS page templates, the server now dynamically branches based on the request headers:
- **Web Clients:** Receive standard HTML page rendering or redirects (`302 Found`).
- **Expo App Clients:** Receive standard JSON responses with appropriate HTTP status codes (e.g. `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`).

---

## 1. Authentication Middleware
**File:** [usersAuthentication.js](file:///home/mdspl-sujith/sujith/retro/middleware/usersAuthentication.js)

- The `isLoggedIn` middleware checks for the presence of the `platform` header.
- If the header is set to `expo`:
  - Returns `401 Unauthorized` as JSON if the user session is missing:
    ```json
    { "message": "Unauthorized" }
    ```
  - Returns `403 Forbidden` if the user is blocked:
    ```json
    { "message": "User is blocked" }
    ```

---

## 2. Login Verification API
**File:** [usersController.js](file:///home/mdspl-sujith/sujith/retro/controllers/usersController.js) (under `verifyLogin`)

- Maps the standard Mongoose user document to match the React Native `User` interface properties (`id` and `name` instead of `_id` and `username`).
- **Endpoint response structure for Expo:**
  ```json
  {
    "message": "user found",
    "token": "sujith123",
    "user": {
      "id": "USER_OBJECT_ID",
      "email": "user@example.com",
      "name": "Username"
    }
  }
  ```

---

## 3. User Profile API
**File:** [usersController.js](file:///home/mdspl-sujith/sujith/retro/controllers/usersController.js) (under `loadProfile`)

- If `platform === 'expo'`, the API bypasses rendering the EJS profile view and returns the logged-in user profile payload:
  ```json
  {
    "id": "USER_OBJECT_ID",
    "email": "user@example.com",
    "name": "Username"
  }
  ```

---

## 4. Logout Route
**Files:**
- Route: [usersRoute.js](file:///home/mdspl-sujith/sujith/retro/routes/usersRoute.js)
- Controller: [usersController.js](file:///home/mdspl-sujith/sujith/retro/controllers/usersController.js) (under `LoggedOut`)

- Added a `POST /logout` route handler (in addition to the existing `GET` route) to align with standard API logout design.
- If the request header contains `platform: expo`, the API returns a JSON response indicating successful logout instead of redirecting the client:
  ```json
  { "message": "Logged out successfully" }
  ```
