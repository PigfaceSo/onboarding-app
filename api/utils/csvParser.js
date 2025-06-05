const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse');
const db = require('../models'); // Imports db.categories and db.items

// For local development and testing, access the file directly
// For production, we'll need to handle file access differently in serverless environment
const getFilePath = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, the CSV would ideally be stored in a cloud storage service
    // For this implementation, we assume it's uploaded to Vercel or accessed via API
    return process.env.CSV_FILE_PATH;
  } else {
    // Local development path
    return path.join(process.cwd(), 'Knowledge base', 'Villa Sand Onboarding List(Facilities List).csv');
  }
};

async function seedDatabaseFromCSV() {
  console.log('Starting CSV parsing and database seeding...');
  try {
    const csvFilePath = getFilePath();
    
    // In serverless, we need to handle file access differently
    let fileContent;
    try {
      fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
    } catch (error) {
      console.error('Error reading CSV file:', error);
      return { success: false, message: `Error reading CSV file: ${error.message}` };
    }

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
        } catch (error) {
          console.error(`Error creating item '${itemName}':`, error.message);
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
