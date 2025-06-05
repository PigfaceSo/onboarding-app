module.exports = app => {
  const itemsController = require("../controllers/item.controller.js");
  var router = require("express").Router();

  // Route to seed data from CSV
  // IMPORTANT: In a production environment, protect this route or run seeding as a separate script.
  router.get("/seed-data", itemsController.seedData);

  // Retrieve all Items (grouped by category)
  router.get("/items", itemsController.findAllItems);

  // Update an Item with id
  router.put("/items/:id", itemsController.updateItem);

  // Base path for these routes
  app.use('/api', router);
};
