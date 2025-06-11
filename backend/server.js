const express = require("express");
const cors = require("cors");
const db = require("./models"); // Imports models and sequelize instance

const app = express();

// CORS configuration - adjust origin as needed for your frontend
var corsOptions = {
  origin: "http://localhost:3000" // Default React dev server port
};
app.use(cors());

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Sync database
// In development, you might use { force: true } to drop and re-sync tables.
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Villa Onboarding Checklist application backend." });
});

// Include API routes
require("./routes/item.routes.js")(app);

// Include Villa API routes
const villaRoutes = require("./routes/villas.js");
app.use('/api/villas', villaRoutes);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Data seeding can be triggered at http://localhost:${PORT}/api/seed-data (GET request)`);
});
