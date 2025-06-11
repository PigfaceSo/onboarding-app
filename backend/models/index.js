const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  operatorsAliases: 0, // 0 instead of false for Sequelize v6+
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.categories = require("./category.model.js")(sequelize, Sequelize);
db.items = require("./item.model.js")(sequelize, Sequelize);

// Define associations
// A category can have multiple items
db.categories.hasMany(db.items, {
  as: "items",
  foreignKey: { allowNull: false }, // Each item must belong to a category
  onDelete: 'CASCADE' // If a category is deleted, its items are also deleted
});
db.items.belongsTo(db.categories, {
  as: "category",
  foreignKey: { allowNull: false }
});

// --- New Model Imports and Associations from Villa Onboarding App - Phase 2 ---

db.villa = require("./Villa.js")(sequelize, Sequelize);
db.owner = require("./Owner.js")(sequelize, Sequelize);
db.villaChecklistItem = require("./VillaChecklistItem.js")(sequelize, Sequelize);
db.villaDocument = require("./VillaDocument.js")(sequelize, Sequelize);
db.onboardingProgress = require("./OnboardingProgress.js")(sequelize, Sequelize);

// Owner - Villa associations
db.owner.hasMany(db.villa, { foreignKey: 'owner_id', as: 'villas' });
db.villa.belongsTo(db.owner, { foreignKey: 'owner_id', as: 'owner' });

// Villa - VillaChecklistItem associations
db.villa.hasMany(db.villaChecklistItem, { foreignKey: 'villa_id', as: 'checklistItems' });
db.villaChecklistItem.belongsTo(db.villa, { foreignKey: 'villa_id', as: 'villa' });

// Item - VillaChecklistItem associations (Item already exists)
db.items.hasMany(db.villaChecklistItem, { foreignKey: 'item_id', as: 'villaChecklistEntries' });
db.villaChecklistItem.belongsTo(db.items, { foreignKey: 'item_id', as: 'item' });

// Villa - VillaDocument associations
db.villa.hasMany(db.villaDocument, { foreignKey: 'villa_id', as: 'documents' });
db.villaDocument.belongsTo(db.villa, { foreignKey: 'villa_id', as: 'villa' });

// Villa - OnboardingProgress associations
db.villa.hasMany(db.onboardingProgress, { foreignKey: 'villa_id', as: 'progressSteps' });
db.onboardingProgress.belongsTo(db.villa, { foreignKey: 'villa_id', as: 'villa' });

// --- End of New Model Imports and Associations ---

module.exports = db;
