# Villa Onboarding Checklist Web App (PERN Stack)

This application allows operational employees to track the presence or absence of facility items for Villa Sand, based on an onboarding checklist. It uses a PERN (PostgreSQL, Express.js, React, Node.js) stack.

## Tech Stack

- **P**ostgreSQL: Database
- **E**xpress.js: Backend framework
- **R**eact: Frontend library
- **N**ode.js: Backend runtime environment
- Sequelize: ORM for PostgreSQL
- `csv-parse`: For parsing the CSV data.
- `cors`: For enabling Cross-Origin Resource Sharing.

## Project Structure

```
d:\Onboarding App\
├── backend\        # Node.js, Express, Sequelize API
│   ├── config\      # Database configuration
│   ├── controllers\ # Request handlers
│   ├── models\      # Sequelize models (Category, Item)
│   ├── routes\      # API routes
│   ├── utils\       # Utility scripts (e.g., csvParser.js)
│   ├── package.json
│   └── server.js     # Main backend server file
├── frontend\       # React app (created with create-react-app)
│   ├── public\
│   ├── src\         # React components and logic
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── Knowledge base\ # Contains the source CSV for facilities
│   └── Villa Sand Onboarding List(Facilities List).csv
├── .gitignore
└── README.md
```

## Prerequisites

1.  **Node.js and npm:** Ensure Node.js (v14+ recommended) and npm are installed. You can download them from [nodejs.org](https://nodejs.org/).
2.  **PostgreSQL:** Install PostgreSQL server on your local machine. You can download it from [postgresql.org/download/](https://www.postgresql.org/download/).
    *   During installation, you will be prompted to set a password for the default superuser `postgres`. **Remember this password.**

## Setup and Running the Application

Follow these steps in order:

### 1. PostgreSQL Database Setup

   a. **Access `psql` (SQL Shell):**
      Open the SQL Shell (psql) that comes with your PostgreSQL installation. You will be prompted for connection details:
      - Server [localhost]: Press Enter
      - Database [postgres]: Press Enter
      - Port [5432]: Press Enter
      - Username [postgres]: Press Enter
      - Password for user postgres: Enter the password you set during PostgreSQL installation (e.g., `1806`).

   b. **Create the Database:**
      Once connected (you'll see the `postgres=#` prompt), create the database for the application. We'll use the name `villa_onboarding` as configured in the backend.
      ```sql
      CREATE DATABASE villa_onboarding;
      ```
      You should see `CREATE DATABASE` as a response. You can then exit `psql` by typing `\q` and pressing Enter.

### 2. Backend Setup

   a. **Navigate to the backend directory:**
      ```bash
      cd "d:\Onboarding App\backend"
      ```

   b. **Install dependencies:**
      ```bash
      npm install
      ```

   c. **Configure Database Connection:**
      Open `backend/config/db.config.js` and ensure it matches your PostgreSQL setup. It should look like this if you used the `postgres` user and the password `1806`, and created the `villa_onboarding` database:
      ```javascript
      module.exports = {
        HOST: "localhost",
        USER: "postgres", // Or your specific PostgreSQL username
        PASSWORD: "1806",   // The password for the USER
        DB: "villa_onboarding", // The database name you created
        dialect: "postgres",
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      };
      ```

   d. **Run the backend server:**
      ```bash
      npm start
      ```
      The server will attempt to connect to the database and sync the models. You should see messages like:
      `Executing (default): SELECT 1+1 AS result` (Sequelize connection test)
      `Synced db.`
      `Server is running on port 8080.`
      `Data seeding can be triggered at http://localhost:8080/api/seed-data (GET request)`

   e. **Seed Initial Data (One-time setup):**
      After the backend server is running and the database is synced, open your web browser and go to:
      `http://localhost:8080/api/seed-data`
      This will populate the `categories` and `items` tables in your `villa_onboarding` database using the data from `Knowledge base/Villa Sand Onboarding List(Facilities List).csv` (starting from line 42 as per `csvParser.js`).
      Check the backend console for logs indicating successful seeding.

### 3. Frontend Setup

   a. **Navigate to the frontend directory (in a new terminal/command prompt):**
      ```bash
      cd "d:\Onboarding App\frontend"
      ```

   b. **Install dependencies:**
      ```bash
      npm install
      ```

   c. **Run the frontend development server:**
      ```bash
      npm start
      ```
      This will typically open the application in your default web browser at `http://localhost:3000`.

## Using the Application

Once both backend and frontend are running:

- Open `http://localhost:3000` in your browser.
- You should see the checklist items grouped by category.
- You can toggle the presence of an item using the "Present" / "Missing" button.
- You can add notes to each item and save them.
- Changes are saved to the PostgreSQL database via the backend API.

## API Endpoints (Backend - running on `http://localhost:8080`)

- `GET /api/items`: Fetches all items grouped by category.
- `PUT /api/items/:id`: Updates the status (`is_present`) and notes for a specific item.
  - Request body example: `{"is_present": true, "notes": "New note for item"}`
- `GET /api/seed-data`: (For initial setup or data reset) Parses the CSV and populates/re-populates the database.

## Next Steps / Future Enhancements (from previous session)

- Refactor frontend components into separate files.
- Add authentication and authorization if needed.
- Improve UI/UX with better item filtering, search, or grouping.
- Add user roles and permissions for editing checklist.
- Secure backend seeding endpoint.
- Add error handling and notifications on frontend.
- Deploy backend and frontend to production environment.
- Possibly add real-time updates via WebSocket or polling.
