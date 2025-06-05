const db = require("../models");
const Item = db.items;
const Category = db.categories;
const { seedDatabaseFromCSV } = require('../utils/csvParser');

// Retrieve all Items from the database, grouped by category.
exports.findAllItems = async (req, res) => {
  try {
    console.log('Fetching categories with items...');
    
    // First, check if we have any categories
    const categoryCount = await Category.count();
    console.log(`Found ${categoryCount} categories in database`);
    
    if (categoryCount === 0) {
      console.log('No categories found, attempting to create default category');
      // Create at least one default category if none exist
      const defaultCategory = await Category.create({
        name: 'General Facilities'
      });
      console.log(`Created default category: ${defaultCategory.name}`);
    }
    
    const categories = await Category.findAll({
      include: [{
        model: Item,
        as: 'items',
        attributes: ['id', 'name', 'is_present', 'notes'] // Specify item attributes to include
      }],
      order: [
        ['name', 'ASC'], // Order categories by name
        [{ model: Item, as: 'items' }, 'name', 'ASC'] // Order items within each category by name
      ]
    });
    
    console.log(`Returning ${categories.length} categories with their items`);
    res.send(categories);
  } catch (err) {
    console.error('Error in findAllItems:', err);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving items."
    });
  }
};

// Update an Item by the id in the request
exports.updateItem = async (req, res) => {
  const id = req.params.id;

  // Validate request body
  if (req.body.is_present === undefined && req.body.notes === undefined) {
    return res.status(400).send({
      message: "Content for update (is_present or notes) cannot be empty!"
    });
  }

  const updateData = {};
  if (req.body.is_present !== undefined) {
    updateData.is_present = req.body.is_present;
  }
  if (req.body.notes !== undefined) {
    updateData.notes = req.body.notes;
  }

  try {
    const num = await Item.update(updateData, {
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "Item was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Item with id=${id}. Maybe Item was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Item with id=" + id
    });
  }
};

// Controller to trigger CSV seeding
exports.seedData = async (req, res) => {
  try {
    // Ensure DB is synced before seeding
    // In a real app, you might want to ensure this is only run by an admin or once during setup.
    await db.sequelize.sync(); // { force: true } can be used to drop and recreate tables if needed during dev
    console.log('Database synced. Proceeding to seed data...');
    const result = await seedDatabaseFromCSV();
    if (result.success) {
      res.status(200).send({ message: result.message, details: { categories: result.categoriesCreated, items: result.itemsCreated } });
    } else {
      res.status(500).send({ message: result.message });
    }
  } catch (error) {
    console.error('Error during data seeding process:', error);
    res.status(500).send({
      message: `Failed to seed data: ${error.message}`
    });
  }
};
