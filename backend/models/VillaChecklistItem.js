module.exports = (sequelize, Sequelize) => {
  const VillaChecklistItem = sequelize.define("villa_checklist_item", {
    is_present: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: Sequelize.TEXT
    },
    checked_by: {
      type: Sequelize.STRING(100)
    },
    checked_at: {
      type: Sequelize.DATE
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['villa_id', 'item_id'] // Sequelize handles foreign key naming
      }
    ]
  });
  return VillaChecklistItem;
};
