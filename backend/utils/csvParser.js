const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');
const db = require('../models'); // Imports db.categories and db.items

// Path to the CSV file
const csvFilePath = path.join(__dirname, '..', '..', 'Knowledge base', 'Villa Sand Onboarding List(Facilities List).csv');

async function seedDatabaseFromCSV() {
  console.log('Starting CSV parsing and database seeding...');
  try {
    const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

    // Configure the parser
    // We start parsing from line 42 (index 41) as per CSV structure observed.
    // Line 41 is "Items,,Please add Comments..."
    const parser = parse(fileContent, {
      delimiter: ',',
      from_line: 42, // Skip header rows and general info
      skip_empty_lines: true,
      relax_column_count: true, // Handles rows with varying number of columns
    });

    let currentCategoryId = null;
    let categoriesCreated = 0;
    let itemsCreated = 0;

    for await (const record of parser) {
      const colA = record[0] ? record[0].trim() : '';
      const colB = record[1] ? record[1].trim().toUpperCase() : '';
      const colC = record[2] ? record[2].trim() : '';

      // Heuristic for identifying a category header:
      // - Column A is not empty and contains a colon.
      // - Column B is typically empty or not 'TRUE'/'FALSE' for category lines.
      if (colA && colA.includes(':') && (colB === '' || (colB !== 'TRUE' && colB !== 'FALSE'))) {
        const categoryName = colA.substring(0, colA.indexOf(':')).trim();
        if (categoryName) {
          try {
            const [category, created] = await db.categories.findOrCreate({
              where: { name: categoryName },
              defaults: { name: categoryName }
            });
            currentCategoryId = category.id;
            if (created) categoriesCreated++;
            // console.log(`Processed category: ${categoryName} (ID: ${currentCategoryId})`);
          } catch (error) {
            console.error(`Error processing category '${categoryName}':`, error.message);
          }
        }
      } else if (colA && (colB === 'TRUE' || colB === 'FALSE') && currentCategoryId) {
        // This is an item row
        const itemName = colA;
        const isPresent = colB === 'TRUE';
        const notes = colC || null;

        try {
          await db.items.create({
            name: itemName,
            is_present: isPresent,
            notes: notes,
            categoryId: currentCategoryId
          });
          itemsCreated++;
          // console.log(`Created item: ${itemName} under category ID: ${currentCategoryId}`);
        } catch (error) {
          console.error(`Error creating item '${itemName}':`, error.message);
          // Potentially an item with the same name under the same category if unique constraints were added (not in current model)
        }
      }
    }

    console.log('CSV parsing and database seeding completed.');
    console.log(`Categories created/found: ${categoriesCreated} (newly created)`);
    console.log(`Items created: ${itemsCreated}`);
    return { success: true, categoriesCreated, itemsCreated, message: 'Database seeded successfully from CSV.' };

  } catch (error) {
    console.error('Error during CSV parsing or database seeding:', error);
    return { success: false, message: `Error seeding database: ${error.message}` };
  }
}

module.exports = { seedDatabaseFromCSV };
