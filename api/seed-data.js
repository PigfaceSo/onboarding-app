// GET /api/seed-data endpoint for initializing the database with master checklist data
const db = require("./models"); // Ensure this path is correct for your models
const Category = db.categories;
const Item = db.items;

// Define master list of categories and items
const masterChecklistData = [
  {
    categoryName: "Sleeping",
    items: [
      "Baby cot", "Bed Linen", "Bunk Bed", "Ceiling fans", "Day bed", "Sofa", 
      "Sofa-bed", "King Size bed", "Queen Size bed", "Double bed", "Twin bed", 
      "Single bed", "Extra bed", "Fireplace", "Hangers", "iPod dock", "Mini Bar", 
      "Non-smoking Rooms", "Personal safe", "Roll/Pull away bed", "Sound system", 
      "TV", "Walk-in wardrobe"
    ]
  },
  {
    categoryName: "Bathrooms",
    items: [
      "Bath tub", "Bathrobe", "Double sink", "En-suite bathroom", "Hairdryer", 
      "His and her shower", "Jacuzzi / Jet tub", "Massaging Bath Tub", "Rain shower", 
      "Separate toilet", "Slippers", "Steam shower", "Toiletries", "Towels", 
      "Universal shaver plug"
    ]
  },
  {
    categoryName: "Dining",
    items: [
      "Blender", "Breakfast bar", "Coffee machine", "Dish washer", "Electric kettle", 
      "Electric stove", "Gas stove", "Induction stove", "Food processor", 
      "Freezer (standalone)", "Fridge (standalone)", "Fridge freezer", 
      "Full crockery set", "Full cutlery utensil kit", "Grill BBQ", "Ice Maker", 
      "Juicer", "Kitchen", "Kitchenette", "Microwave", "Oven", "Oven grill", 
      "Pizza oven", "Pots and Pans", "Rice cooker", "Slow cooker", "Toaster", 
      "Waste disposal", "Water cooler", "Wine cooler", "Wine glasses"
    ]
  },
  {
    categoryName: "Living space",
    items: [
      "Air conditioning", "Bar Area", "Ceiling fans", "Central heating", 
      "Dedicated room for kids", "Elevator", "Fitness room/Gym", "Laundry facilities", 
      "Lounge seating", "Indoor dining", "Music System", "Pool table", "Sofabed", 
      "TV", "Washer / dryer", "Washing machine"
    ]
  },
  {
    categoryName: "Outdoor",
    items: [
      "Balcony", "BBQ / Bar area", "Bicycles", "Garage", "Garden", 
      "Garden furniture", "Gazebo or pergola", "Hammock", "Hot tub", 
      "Outdoor dining", "Outdoor shower", "Parking available", "Solarium/Roof terrace", 
      "Speakers system", "Sun beds / chairs", "Surveillance monitoring", "Swing set", 
      "Terrace", "Trampoline"
    ]
  },
  {
    categoryName: "Business",
    items: [
      "Computer available", "Copier/scanner/printer", "Dedicated office", "Fax", 
      "Intercom between rooms", "Laptop friendly", 
      "Local mobile phone or card available", "Telephone", "Work desk"
    ]
  },
  {
    categoryName: "Entertainment",
    items: [
      "Board games", "Books", "Cable TV", "Satelite TV", "DVD player", "Foosball", 
      "Games console", "Games room", "High definition TV", "Home cinema", "Movies", 
      "Netflix", "Music", "Piano", "Pool table", "Radio", "Snooker table", 
      "Stereo system", "Table tennis", "Darts / Dart board", "Video games"
    ]
  },
  {
    categoryName: "Accessibility",
    items: [
      "Bathroom on groundfloor", "Bedroom on groundfloor", 
      "Common space step free access", "Common space wide doorway clearance", 
      "Disabled parking spot", "Disabled toilet", "Easy access to frontdoor", 
      "Entrance has stairs", "Grap rails in shower and toilet", 
      "Home step free access", "Roll-in shower with bench", "Single-level home", 
      "Stairs inside", "Toilet on groundfloor", "Walkin shower", 
      "Wheelchair access", "Wheelchair lift", "Wide doorway clearance", 
      "Wide hallway clearance"
    ]
  },
  {
    categoryName: "Safety",
    items: [
      "Back-up Generator", "Carbon monoxide detector", "Fenced perimeter", 
      "Fire extinguisher", "First aid kit", "Garden enclosed", "Garden not secured", 
      "Safety guard", "Security / Alarm system", "Smoke detector", "Stair gates", 
      "Water sprinkler system"
    ]
  },
  {
    categoryName: "Child friendly",
    items: [
      "Anti slip bath math", "Baby bath", "Baby bath toys", "Baby creche", 
      "Baby den", "Baby dvds", "Baby loo seat", "Baby monitor", "Baby nightlight", 
      "Baby pack’n’play travel crib", "Baby stairgate", "Babysitting", 
      "Bed guards", "Booster seat", "Changing mat", "Changing table", 
      "Children toys", "Electric socket guards", "Fireplace guards", "Highchair", 
      "Indoor baby toys", "Kids club", "Kids pool", "Plastic crockery", 
      "Pool fence", "Pool slide", "Room darkening shades", "Steriliser", 
      "Table corners guards", "Window guards"
    ]
  }
];

// Initialize database connection
const initializeDb = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await initializeDb();
    
    // Sync database - use { force: true } to ensure clean seed
    // This will drop existing tables and recreate them
    await db.sequelize.sync({ force: true }); 
    console.log('Database synced (forced). Proceeding to seed data...');

    let categoriesCreatedCount = 0;
    let itemsCreatedCount = 0;

    for (const categoryData of masterChecklistData) {
      const [category, createdCat] = await Category.findOrCreate({
        where: { name: categoryData.categoryName },
        defaults: { name: categoryData.categoryName }
      });
      if (createdCat) categoriesCreatedCount++;

      if (categoryData.items && categoryData.items.length > 0) {
        for (const itemName of categoryData.items) {
          const [item, createdItem] = await Item.findOrCreate({
            where: { name: itemName, categoryId: category.id }, // Use category_id from Category model
            defaults: { 
              name: itemName, 
              categoryId: category.id,
              // is_present and notes will default to their model definitions (e.g., false, null)
            }
          });
          if (createdItem) itemsCreatedCount++;
        }
      }
    }
    
    return res.status(200).json({ 
      message: "Database seeded successfully with master checklist data.",
      details: { 
        categoriesCreated: categoriesCreatedCount, 
        itemsCreated: itemsCreatedCount 
      } 
    });

  } catch (error) {
    console.error('Error during data seeding process:', error);
    return res.status(500).json({
      message: `Failed to seed data: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
